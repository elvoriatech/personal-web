import "server-only";

import { SEND_DELAY_MS } from "./constants";
import { plainTextToHtml, wrapCampaignEmailHtml } from "./emailLayout";
import { formatSendError, sendHtmlEmail } from "./mailer";
import {
  appendSendLog,
  updateRecipientAfterSend,
  type RecipientInput,
} from "./store";
import { applyTemplateVars, recipientToVars } from "./templateVars";
import { site } from "@/content/site";
import type { EmailTheme } from "./themes";
import type { CampaignTemplate, EmailTemplateType, Recipient } from "./types";

export type BatchResult = {
  sent: number;
  failed: number;
  skippedOptedOut: number;
  skippedInvalidDomain: number;
  skippedBounced: number;
  errors: string[];
};

const SKIP_OPTED_OUT = "Skipped: recipient opted out. Never contact again.";
const SKIP_BOUNCED =
  "Skipped: a previous send hard-bounced (mailbox does not exist).";
const SKIP_INVALID_DOMAIN =
  "Skipped: domain has no MX or A DNS records — sending would hard-bounce.";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Sends one batch.
 *
 * The three guards below are checked at send time, not only when the list is
 * built — a recipient can opt out or bounce after a job is queued, and mailing
 * them anyway is both a deliverability problem and, for opt-outs, a legal one.
 */
export async function sendBatchToRecipients(params: {
  recipients: Recipient[];
  template: CampaignTemplate;
  templateType: EmailTemplateType;
  autoFollowUp: boolean;
  theme: EmailTheme;
  campaignId: string;
}): Promise<BatchResult> {
  const result: BatchResult = {
    sent: 0,
    failed: 0,
    skippedOptedOut: 0,
    skippedInvalidDomain: 0,
    skippedBounced: 0,
    errors: [],
  };

  const bcc = process.env.CAMPAIGN_BCC || undefined;

  for (const [index, r] of params.recipients.entries()) {
    const log = (status: Parameters<typeof appendSendLog>[0]["status"], message: string) =>
      appendSendLog({
        campaignId: params.campaignId,
        recipientId: r.id,
        templateType: params.templateType,
        email: r.email,
        status,
        errorMessage: message,
      });

    if (r.optedOut) {
      result.skippedOptedOut++;
      await log("skipped_opted_out", SKIP_OPTED_OUT);
      continue;
    }
    if (r.status === "bounced") {
      result.skippedBounced++;
      await log("skipped_bounced", SKIP_BOUNCED);
      continue;
    }
    if (r.domainStatus === "invalid") {
      result.skippedInvalidDomain++;
      await log("skipped_invalid_domain", SKIP_INVALID_DOMAIN);
      continue;
    }

    const vars = recipientToVars(r);
    const subject = applyTemplateVars(params.template.subject, vars);
    const bodyText = applyTemplateVars(params.template.bodyHtml, vars);
    const html = wrapCampaignEmailHtml(plainTextToHtml(bodyText), {
      preheader: subject,
      showOptOut: true,
      theme: params.theme,
    });

    // Throttle between individual sends rather than only between batches —
    // Gmail rate-limits on short bursts.
    if (index > 0) await sleep(SEND_DELAY_MS);

    const res = await sendHtmlEmail({
      to: r.email,
      subject,
      html,
      text: bodyText,
      bcc,
      // Replies always come back to the personal inbox, whichever transport
      // actually carried the message out.
      replyTo: process.env.CONTACT_TO_EMAIL || site.email,
    });

    if (res.sent) {
      result.sent++;
      await updateRecipientAfterSend(r.id, params.templateType, {
        autoFollowUp: params.autoFollowUp && params.templateType === "initial",
      });
      await log("sent", "");
    } else {
      result.failed++;
      const detail =
        res.reason === "not_configured"
          ? "Mail is not configured on the server."
          : formatSendError(res.detail);
      result.errors.push(`${r.email}: ${detail}`);
      await log("failed", detail);
    }
  }

  return result;
}

export type { RecipientInput };
