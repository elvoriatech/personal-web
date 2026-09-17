import "server-only";

import { buildCoverLetterBuffer, buildResumeBuffer } from "@/lib/documents/build";
import { getDocuments } from "@/lib/documents/store";
import {
  DEFAULT_DOCUMENT_FORMAT,
  DOCUMENT_CONTENT_TYPES,
  type DocumentFormat,
} from "@/lib/documents/types";
import { plainTextToHtml, wrapCampaignEmailHtml } from "./emailLayout";
import { formatSendError, sendHtmlEmail, type MailAttachment } from "./mailer";
import { site } from "@/content/site";
import { ATTACHMENT_OPTIONS, attachmentFilename, type AttachmentId } from "./attachments";
import { DEFAULT_EMAIL_THEME, type EmailTheme } from "./themes";
import type { TransportChoice } from "@/lib/mail/transports";

export { ATTACHMENT_OPTIONS };
export type { AttachmentId };

/**
 * Generates the selected documents fresh, so an attachment is never stale.
 *
 * PDF is the default: it opens identically for every recipient and is what a
 * recruiter or client expects. Word is sent only when it is asked for.
 */
export async function buildAttachments(
  ids: AttachmentId[],
  format: DocumentFormat = DEFAULT_DOCUMENT_FORMAT
): Promise<MailAttachment[]> {
  if (!ids.length) return [];
  const { resume, coverLetter } = await getDocuments();
  const out: MailAttachment[] = [];

  for (const id of ids) {
    if (!ATTACHMENT_OPTIONS.some((o) => o.id === id)) continue;

    let content: Buffer;
    if (id === "resume_ats") content = await buildResumeBuffer(resume, "ats", format);
    else if (id === "resume_design") content = await buildResumeBuffer(resume, "design", format);
    else if (id === "resume_onepage") content = await buildResumeBuffer(resume, "compact", format);
    else content = await buildCoverLetterBuffer(coverLetter, format);

    out.push({
      filename: attachmentFilename(id, format),
      content,
      contentType: DOCUMENT_CONTENT_TYPES[format],
    });
  }
  return out;
}

export type PersonalSendResult =
  | { ok: true; messageId: string; attached: string[] }
  | { ok: false; error: string };

/**
 * One-off personal email — an application, an introduction, a reply to a lead.
 * Uses the same branded shell as campaigns but omits the cold-outreach opt-out
 * line, which would be odd on a message the recipient is expecting.
 */
export async function sendPersonalEmail(params: {
  to: string;
  subject: string;
  body: string;
  attachments: AttachmentId[];
  /** File format for those attachments. Defaults to PDF. */
  attachmentFormat?: DocumentFormat;
  ccSelf?: boolean;
  theme?: EmailTheme;
  /** Which account sends it; "auto" prefers a real mailbox. */
  via?: TransportChoice;
}): Promise<PersonalSendResult> {
  const to = params.to.trim();
  if (!to || !to.includes("@")) return { ok: false, error: "A valid recipient is required." };
  if (!params.subject.trim()) return { ok: false, error: "A subject is required." };
  if (!params.body.trim()) return { ok: false, error: "The message body is empty." };

  let attachments: MailAttachment[];
  try {
    attachments = await buildAttachments(
      params.attachments,
      params.attachmentFormat ?? DEFAULT_DOCUMENT_FORMAT
    );
  } catch (err) {
    return {
      ok: false,
      error: `Could not build the attachments: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const html = wrapCampaignEmailHtml(plainTextToHtml(params.body), {
    preheader: params.subject,
    showOptOut: false,
    theme: params.theme ?? DEFAULT_EMAIL_THEME,
  });

  const res = await sendHtmlEmail({
    to,
    subject: params.subject.trim(),
    html,
    text: params.body,
    bcc: params.ccSelf ? site.email : undefined,
    replyTo: site.email,
    attachments,
    via: params.via ?? "auto",
    purpose: "personal",
  });

  if (!res.sent) {
    return {
      ok: false,
      error:
        res.reason === "not_configured"
          ? "No sending account is set up. Connect Hotmail, or set RESEND_API_KEY."
          : formatSendError(res.detail),
    };
  }

  return {
    ok: true,
    messageId: res.messageId,
    attached: attachments.map((a) => a.filename),
  };
}
