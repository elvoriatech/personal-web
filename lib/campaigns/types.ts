export type EmailTemplateType = "initial" | "follow_up_1" | "follow_up_2";

export type RecipientStatus = "not_sent" | "sent" | "replied" | "bounced";

/**
 * Result of the DNS audit for a recipient's domain.
 * - 'ok'          MX records exist.
 * - 'ok_fallback' No MX, but A/AAAA records exist (deliverable per RFC 5321).
 * - 'invalid'     Bad syntax, null MX, or no DNS records — would hard-bounce.
 * - 'unknown'     Transient DNS failure; never treated as invalid.
 */
export type DomainStatus = "ok" | "ok_fallback" | "invalid" | "unknown";

export type CampaignTemplate = {
  templateType: EmailTemplateType;
  subject: string;
  bodyHtml: string;
  updatedAt: string;
};

export type Recipient = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  industry: string;
  notes: string;
  status: RecipientStatus;
  autoFollowUp: boolean;
  initialSentAt: string | null;
  followUp1SentAt: string | null;
  followUp2SentAt: string | null;
  repliedAt: string | null;
  lastTemplateType: EmailTemplateType | null;
  domainStatus: DomainStatus | null;
  domainCheckedAt: string | null;
  bouncedAt: string | null;
  bounceReason: string;
  /** Permanent opt-out. Checked before every send; never cleared automatically. */
  optedOut: boolean;
  optedOutAt: string | null;
  createdAt: string;
};

export type SendLogStatus =
  | "sent"
  | "failed"
  | "skipped_invalid_domain"
  | "skipped_bounced"
  | "skipped_opted_out";

export type SendJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type SendJobSelectionMode = "all_not_sent" | "recipient_ids";

export type SendJob = {
  id: string;
  campaignId: string | null;
  status: SendJobStatus;
  templateType: EmailTemplateType;
  autoFollowUp: boolean;
  selectionMode: SendJobSelectionMode;
  totalCount: number;
  processedIndex: number;
  sentCount: number;
  failedCount: number;
  lastError: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export const TEMPLATE_LABELS: Record<EmailTemplateType, string> = {
  initial: "Initial outreach",
  follow_up_1: "Follow-up (3 days)",
  follow_up_2: "Final follow-up",
};

export const TEMPLATE_TYPES: EmailTemplateType[] = [
  "initial",
  "follow_up_1",
  "follow_up_2",
];
