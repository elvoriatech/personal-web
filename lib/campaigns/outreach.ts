import "server-only";

import { site } from "@/content/site";
import { fillPlaceholders } from "@/lib/documents/types";
import type { TransportChoice } from "@/lib/mail/transports";
import { escapeHtml, plainTextToHtml, wrapCampaignEmailHtml } from "./emailLayout";
import { formatSendError, sendHtmlEmail } from "./mailer";
import { companyVars, findPlaceholders, senderVars } from "./outreachVars";
import { appendSendLog, getRecipient, updateRecipientAfterSend } from "./store";
import type { EmailTheme } from "./themes";
import type { Recipient } from "./types";

/**
 * One-click outreach: an editable template from /admin/templates, sent to one
 * company. Preview and send both go through `renderOutreachEmail`, so the
 * email that goes out is the one the admin approved.
 */

// A character escapeHtml leaves alone, so an unfilled placeholder survives
// the plain-text → HTML step and can be highlighted afterwards.
const HOLE = "\u0000";

export function outreachVars(recipient: Recipient, extras: Record<string, string>): Record<string, string> {
  // Extras last would let a stray "company" field override the record; put
  // them first so the company and sender always win.
  return { ...extras, ...companyVars(recipient), ...senderVars() };
}

export function renderOutreachEmail(params: {
  subject: string;
  body: string;
  vars: Record<string, string>;
  theme: EmailTheme;
  /** Preview only: show unfilled placeholders as highlighted [name] markers. */
  markMissing?: boolean;
}): { subject: string; html: string; text: string; missing: string[] } {
  const subject = fillPlaceholders(params.subject, params.vars).trim();
  const text = fillPlaceholders(params.body, params.vars);
  const missing = findPlaceholders(subject, text);

  const bodyForHtml = params.markMissing
    ? text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name: string) => `${HOLE}${name}${HOLE}`)
    : text;
  let bodyHtml = plainTextToHtml(bodyForHtml);
  if (params.markMissing) {
    bodyHtml = bodyHtml.replace(
      new RegExp(`${HOLE}(\\w+)${HOLE}`, "g"),
      (_, name: string) =>
        `<mark style="background:#FEF3C7;color:#92400E;padding:0 3px;border-radius:3px;">[${escapeHtml(name)}]</mark>`
    );
  }

  const html = wrapCampaignEmailHtml(bodyHtml, {
    preheader: subject,
    // Cold outreach always carries the opt-out line (UWG §7 / GDPR).
    showOptOut: true,
    theme: params.theme,
  });
  return { subject, html, text, missing };
}

export type OutreachSendResult =
  | { ok: true; messageId: string; to: string; sentAt: string }
  | { ok: false; error: string };

export async function sendOutreachToRecipient(params: {
  templateId: string;
  subject: string;
  body: string;
  recipientId: string;
  extras: Record<string, string>;
  theme: EmailTheme;
  via: TransportChoice;
}): Promise<OutreachSendResult> {
  if (!params.templateId) return { ok: false, error: "Save the template before sending from it." };
  const r = await getRecipient(params.recipientId);
  if (!r) return { ok: false, error: "That company is no longer in your list." };

  const log = (status: Parameters<typeof appendSendLog>[0]["status"], message: string) =>
    appendSendLog({
      campaignId: null,
      recipientId: r.id,
      templateType: "initial",
      email: r.email,
      status,
      errorMessage: message,
      outreachTemplateId: params.templateId,
    });

  // The same three guards the campaign worker applies, checked at send time.
  if (r.optedOut) {
    await log("skipped_opted_out", "Skipped: recipient opted out. Never contact again.");
    return { ok: false, error: `${r.companyName || r.email} opted out — they must not be contacted again.` };
  }
  if (r.status === "bounced") {
    await log("skipped_bounced", "Skipped: a previous send hard-bounced.");
    return { ok: false, error: `An earlier email to ${r.email} bounced — the mailbox does not exist.` };
  }
  if (r.domainStatus === "invalid") {
    await log("skipped_invalid_domain", "Skipped: domain has no MX or A DNS records.");
    return { ok: false, error: `${r.email.split("@")[1]} has no mail server — the email would bounce.` };
  }

  const email = renderOutreachEmail({
    subject: params.subject,
    body: params.body,
    vars: outreachVars(r, params.extras),
    theme: params.theme,
  });
  if (!email.subject) return { ok: false, error: "The subject is empty." };
  if (!email.text.trim()) return { ok: false, error: "The message body is empty." };
  if (email.missing.length) {
    return {
      ok: false,
      error: `Fill in ${email.missing.map((m) => `{{${m}}}`).join(", ")} before sending.`,
    };
  }

  const res = await sendHtmlEmail({
    to: r.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
    bcc: process.env.CAMPAIGN_BCC || undefined,
    replyTo: process.env.CONTACT_TO_EMAIL || site.email,
    via: params.via,
    purpose: "campaign",
  });

  if (!res.sent) {
    const detail =
      res.reason === "not_configured"
        ? "No sending account is set up. Connect Hotmail under Send an email, or set RESEND_API_KEY."
        : formatSendError(res.detail);
    await log("failed", detail);
    return { ok: false, error: detail };
  }

  await updateRecipientAfterSend(r.id, "initial", { autoFollowUp: false });
  await log("sent", "");
  return { ok: true, messageId: res.messageId, to: r.email, sentAt: new Date().toISOString() };
}
