import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/content/site";
import { getMicrosoftConnection, isMicrosoftConfigured, microsoftTransporter, verifyMicrosoft } from "@/lib/mail/microsoft";
import type { MailStatus, MailTransport, TransportChoice } from "@/lib/mail/transports";

export type MailAttachment = { filename: string; content: Buffer; contentType?: string };

export type SendResult =
  | { sent: true; messageId: string }
  | { sent: false; reason: "not_configured" | "error"; detail: string };

export type MailPurpose = "personal" | "campaign";

/* ------------------------------ what exists ------------------------------ */

/** Env-only view, kept for callers that cannot await (banners, cron summaries). */
export function mailerMode(): "smtp" | "resend" | "unconfigured" {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) return "smtp";
  if (process.env.RESEND_API_KEY) return "resend";
  return "unconfigured";
}

function resendFrom(): string {
  return process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";
}

/** Resend's shared sender only reaches the account owner; a verified domain lifts that. */
function resendNote(): string {
  return process.env.CONTACT_FROM_EMAIL
    ? "Sends from your verified domain."
    : "Test sender — delivers only to your own address until zahoorahmed.de is verified in Resend.";
}

/**
 * The full picture, including the database-backed Microsoft connection.
 * Personal mail prefers a real mailbox (replies thread, Sent folder fills);
 * campaigns prefer a sending service on a verified domain.
 */
export async function getMailStatus(): Promise<MailStatus> {
  const ms = await getMicrosoftConnection();
  const available: MailStatus["available"] = [];

  if (ms) {
    available.push({
      id: "microsoft",
      from: `${site.name} <${ms.accountEmail}>`,
      note: "Your Hotmail mailbox — sent mail shows in Sent, replies land in the same inbox.",
    });
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    available.push({ id: "smtp", from: `${site.name} <${process.env.EMAIL_USER}>`, note: "SMTP mailbox from the environment." });
  }
  if (process.env.RESEND_API_KEY) {
    available.push({ id: "resend", from: resendFrom(), note: resendNote() });
  }

  const has = (id: MailTransport) => available.some((t) => t.id === id);
  const pick = (order: MailTransport[]) => order.find(has) ?? null;

  return {
    available,
    personalDefault: pick(["microsoft", "smtp", "resend"]),
    // Resend's shared sender cannot reach strangers, so without a verified
    // domain a mailbox is the better campaign default.
    campaignDefault: process.env.CONTACT_FROM_EMAIL
      ? pick(["resend", "microsoft", "smtp"])
      : pick(["microsoft", "smtp", "resend"]),
    microsoft: {
      configured: isMicrosoftConfigured(),
      connected: Boolean(ms),
      accountEmail: ms?.accountEmail ?? "",
    },
  };
}

export async function resolveTransport(via: TransportChoice, purpose: MailPurpose): Promise<MailTransport | null> {
  const status = await getMailStatus();
  if (via !== "auto" && status.available.some((t) => t.id === via)) return via;
  return purpose === "personal" ? status.personalDefault : status.campaignDefault;
}

/** Sender line for a transport; falls back to the env/site default. */
export function fromAddress(transport?: MailTransport, accountEmail?: string): string {
  if (transport === "microsoft" && accountEmail) return `${site.name} <${accountEmail}>`;
  if (transport === "resend") return resendFrom();
  const address = process.env.EMAIL_USER || process.env.CONTACT_FROM_EMAIL || site.email;
  return `${site.name} <${address}>`;
}

/* ---------------------------------- SMTP ---------------------------------- */

let smtpTransporter: Transporter | null = null;

function getSmtpTransporter(): Transporter {
  if (!smtpTransporter) {
    // Outlook/Hotmail is the default: it only offers STARTTLS on 587 and
    // refuses implicit TLS on 465, so `secure` defaults to false here.
    const port = Number(process.env.EMAIL_PORT || 587);
    const secure = (process.env.EMAIL_SECURE || "false") === "true";
    smtpTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp-mail.outlook.com",
      port,
      secure,
      requireTLS: !secure,
      auth: {
        user: process.env.EMAIL_USER,
        // App passwords are usually displayed in spaced groups of four.
        pass: (process.env.EMAIL_PASS ?? "").replace(/\s+/g, ""),
      },
    });
  }
  return smtpTransporter;
}

/* --------------------------------- verify --------------------------------- */

export async function verifyMailer(
  via: TransportChoice = "auto"
): Promise<{ ok: boolean; detail: string; transport: MailTransport | null; from: string }> {
  const transport = await resolveTransport(via, "personal");
  if (!transport) return { ok: false, detail: "No sending account is set up.", transport: null, from: "" };

  if (transport === "microsoft") {
    const r = await verifyMicrosoft();
    return { ...r, transport, from: fromAddress("microsoft", r.accountEmail) };
  }
  if (transport === "resend") {
    return { ok: true, detail: `Resend API key present. ${resendNote()}`, transport, from: fromAddress("resend") };
  }
  try {
    await getSmtpTransporter().verify();
    return { ok: true, detail: "SMTP connection verified.", transport, from: fromAddress("smtp") };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : String(err), transport, from: fromAddress("smtp") };
  }
}

/* ---------------------------------- send ---------------------------------- */

export async function sendHtmlEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  bcc?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
  /** Which account to send from; "auto" picks by purpose. */
  via?: TransportChoice;
  purpose?: MailPurpose;
}): Promise<SendResult> {
  const transport = await resolveTransport(params.via ?? "auto", params.purpose ?? "personal");
  if (!transport) {
    return { sent: false, reason: "not_configured", detail: "No sending account is set up." };
  }

  try {
    if (transport === "microsoft") {
      const { transporter, accountEmail } = await microsoftTransporter();
      const info = await transporter.sendMail({
        from: fromAddress("microsoft", accountEmail),
        to: params.to,
        bcc: params.bcc,
        replyTo: params.replyTo,
        subject: params.subject,
        html: params.html,
        text: params.text,
        attachments: params.attachments,
      });
      return { sent: true, messageId: info.messageId };
    }

    if (transport === "smtp") {
      const info = await getSmtpTransporter().sendMail({
        from: fromAddress("smtp"),
        to: params.to,
        bcc: params.bcc,
        replyTo: params.replyTo,
        subject: params.subject,
        html: params.html,
        text: params.text,
        attachments: params.attachments,
      });
      return { sent: true, messageId: info.messageId };
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: resendFrom(),
      to: params.to,
      bcc: params.bcc,
      replyTo: params.replyTo,
      subject: params.subject,
      html: params.html,
      text: params.text ?? "",
      attachments: params.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content.toString("base64"),
      })),
    });
    if (error) return { sent: false, reason: "error", detail: error.message };
    return { sent: true, messageId: data?.id ?? "" };
  } catch (err) {
    return { sent: false, reason: "error", detail: err instanceof Error ? err.message : String(err) };
  }
}

/** Turns provider errors into something an admin can act on. */
export function formatSendError(detail: string): string {
  const d = detail.toLowerCase();
  if (d.includes("only send testing emails") || d.includes("verify a domain")) {
    return (
      "Resend's shared sender only delivers to your own address. Verify zahoorahmed.de at " +
      "resend.com/domains and set CONTACT_FROM_EMAIL — or send from Hotmail instead."
    );
  }
  if (d.includes("not connected")) return detail;
  if (d.includes("invalid_grant") || d.includes("aadsts")) {
    return "Microsoft rejected the saved sign-in. Disconnect and connect Hotmail again under Send an email.";
  }
  if (
    d.includes("invalid login") ||
    d.includes("username and password not accepted") ||
    d.includes("basic authentication") ||
    d.includes("535")
  ) {
    return (
      "The mailbox rejected the password login. Microsoft has disabled basic authentication for " +
      "personal Outlook/Hotmail accounts — use “Connect Hotmail” (OAuth) instead of EMAIL_USER/EMAIL_PASS."
    );
  }
  if (d.includes("rate") || d.includes("too many") || d.includes("exceeded")) {
    return "Rate limited by the mail provider — reduce the batch size or wait before resuming.";
  }
  if (d.includes("550") || d.includes("recipient")) return `Recipient rejected: ${detail}`;
  return detail;
}
