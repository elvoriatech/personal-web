import "server-only";

import {
  buildCoverLetterDocx,
  buildResumeDesignDocx,
  buildResumeDocx,
} from "@/lib/documents/docx";
import { getDocuments } from "@/lib/documents/store";
import { plainTextToHtml, wrapCampaignEmailHtml } from "./emailLayout";
import { formatSendError, sendHtmlEmail, type MailAttachment } from "./mailer";
import { site } from "@/content/site";
import { ATTACHMENT_OPTIONS, type AttachmentId } from "./attachments";
import { DEFAULT_EMAIL_THEME, type EmailTheme } from "./themes";
import type { TransportChoice } from "@/lib/mail/transports";

export { ATTACHMENT_OPTIONS };
export type { AttachmentId };


const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Generates the selected documents fresh, so an attachment is never stale. */
export async function buildAttachments(ids: AttachmentId[]): Promise<MailAttachment[]> {
  if (!ids.length) return [];
  const { resume, coverLetter } = await getDocuments();
  const out: MailAttachment[] = [];

  for (const id of ids) {
    const option = ATTACHMENT_OPTIONS.find((o) => o.id === id);
    if (!option) continue;

    let content: Buffer;
    if (id === "resume_ats") content = await buildResumeDocx(resume);
    else if (id === "resume_design") content = await buildResumeDesignDocx(resume);
    else content = await buildCoverLetterDocx(coverLetter);

    out.push({ filename: option.filename, content, contentType: DOCX_TYPE });
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
    attachments = await buildAttachments(params.attachments);
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
