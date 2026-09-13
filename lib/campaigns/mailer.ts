import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/content/site";

export type MailAttachment = { filename: string; content: Buffer; contentType?: string };

export type SendResult =
  | { sent: true; messageId: string }
  | { sent: false; reason: "not_configured" | "error"; detail: string };

/**
 * SMTP is preferred for outreach: mail leaves your own mailbox, so replies
 * thread normally and the From address is one a recipient can verify. Resend is
 * used only as a fallback, and cannot send from a domain you have not verified.
 */
export function mailerMode(): "smtp" | "resend" | "unconfigured" {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) return "smtp";
  if (process.env.RESEND_API_KEY) return "resend";
  return "unconfigured";
}

export function isMailConfigured(): boolean {
  return mailerMode() !== "unconfigured";
}

export function fromAddress(): string {
  const address = process.env.EMAIL_USER ?? process.env.CONTACT_FROM_EMAIL ?? site.email;
  return `${site.name} <${address}>`;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    // Outlook/Hotmail is the default: it only offers STARTTLS on 587 and
    // refuses implicit TLS on 465, so `secure` defaults to false here.
    const port = Number(process.env.EMAIL_PORT ?? 587);
    const secure = (process.env.EMAIL_SECURE ?? "false") === "true";

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ?? "smtp-mail.outlook.com",
      port,
      secure,
      // Refuse to fall back to an unencrypted session if STARTTLS is missing.
      requireTLS: !secure,
      auth: {
        user: process.env.EMAIL_USER,
        // App passwords are usually displayed in spaced groups of four.
        pass: (process.env.EMAIL_PASS ?? "").replace(/\s+/g, ""),
      },
    });
  }
  return transporter;
}

export async function verifyMailer(): Promise<{ ok: boolean; detail: string }> {
  const mode = mailerMode();
  if (mode === "unconfigured") return { ok: false, detail: "No mail credentials set." };
  if (mode === "resend") return { ok: true, detail: "Resend API key present." };
  try {
    await getTransporter().verify();
    return { ok: true, detail: "SMTP connection verified." };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

export async function sendHtmlEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  bcc?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}): Promise<SendResult> {
  const mode = mailerMode();
  if (mode === "unconfigured") {
    return { sent: false, reason: "not_configured", detail: "Mail is not configured." };
  }

  try {
    if (mode === "smtp") {
      const info = await getTransporter().sendMail({
        from: fromAddress(),
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
      from: process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev",
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
    return {
      sent: false,
      reason: "error",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Turns provider errors into something an admin can act on. */
export function formatSendError(detail: string): string {
  const d = detail.toLowerCase();
  if (
    d.includes("invalid login") ||
    d.includes("username and password not accepted") ||
    d.includes("authenticate") ||
    d.includes("535")
  ) {
    return (
      "SMTP rejected the login. Use an app password rather than your account password. " +
      "Note that Microsoft has been disabling basic authentication on personal " +
      "Outlook/Hotmail accounts — if this keeps failing, the account may no longer " +
      "accept SMTP at all and you will need a domain mailbox or a sending service."
    );
  }
  if (d.includes("basic authentication") || d.includes("disabled")) {
    return (
      "The mail provider has disabled basic authentication for this account. " +
      "Personal Outlook/Hotmail accounts are affected; send from a domain mailbox instead."
    );
  }
  if (d.includes("rate") || d.includes("too many")) {
    return "Rate limited by the mail provider — reduce the batch size or wait before resuming.";
  }
  if (d.includes("550") || d.includes("recipient")) {
    return `Recipient rejected: ${detail}`;
  }
  return detail;
}
