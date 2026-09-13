import "server-only";

import { getPool } from "@/lib/db/client";
import { FOLLOW_UP_1_AFTER_DAYS, FOLLOW_UP_2_AFTER_DAYS } from "./constants";
import type {
  CampaignTemplate,
  DomainStatus,
  EmailTemplateType,
  Recipient,
  RecipientStatus,
  SendLogStatus,
} from "./types";

export class CampaignsNotConfiguredError extends Error {
  constructor() {
    super(
      "No DATABASE_URL is configured. Campaigns need Postgres — add the connection string and apply lib/db/schema.sql."
    );
    this.name = "CampaignsNotConfiguredError";
  }
}

function db() {
  const pool = getPool();
  if (!pool) throw new CampaignsNotConfiguredError();
  return pool;
}

export function isCampaignsConfigured(): boolean {
  return getPool() !== null;
}

type RecipientRow = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  industry: string;
  notes: string;
  status: RecipientStatus;
  auto_follow_up: boolean;
  initial_sent_at: Date | null;
  follow_up_1_sent_at: Date | null;
  follow_up_2_sent_at: Date | null;
  replied_at: Date | null;
  last_template_type: EmailTemplateType | null;
  domain_status: DomainStatus | null;
  domain_checked_at: Date | null;
  bounced_at: Date | null;
  bounce_reason: string;
  opted_out: boolean;
  opted_out_at: Date | null;
  created_at: Date;
};

const iso = (d: Date | null) => (d ? d.toISOString() : null);

function mapRecipient(r: RecipientRow): Recipient {
  return {
    id: r.id,
    companyName: r.company_name,
    contactName: r.contact_name,
    email: r.email,
    industry: r.industry,
    notes: r.notes,
    status: r.status,
    autoFollowUp: r.auto_follow_up,
    initialSentAt: iso(r.initial_sent_at),
    followUp1SentAt: iso(r.follow_up_1_sent_at),
    followUp2SentAt: iso(r.follow_up_2_sent_at),
    repliedAt: iso(r.replied_at),
    lastTemplateType: r.last_template_type,
    domainStatus: r.domain_status,
    domainCheckedAt: iso(r.domain_checked_at),
    bouncedAt: iso(r.bounced_at),
    bounceReason: r.bounce_reason ?? "",
    optedOut: r.opted_out,
    optedOutAt: iso(r.opted_out_at),
    createdAt: r.created_at.toISOString(),
  };
}

const RECIPIENT_COLUMNS = `id, company_name, contact_name, email, industry, notes, status,
  auto_follow_up, initial_sent_at, follow_up_1_sent_at, follow_up_2_sent_at, replied_at,
  last_template_type, domain_status, domain_checked_at, bounced_at, bounce_reason,
  opted_out, opted_out_at, created_at`;

/* ------------------------------- recipients ------------------------------- */

export async function listRecipients(opts: {
  limit?: number;
  offset?: number;
  status?: RecipientStatus | "all";
  search?: string;
} = {}): Promise<{ rows: Recipient[]; total: number }> {
  const where: string[] = [];
  const values: unknown[] = [];

  if (opts.status && opts.status !== "all") {
    values.push(opts.status);
    where.push(`status = $${values.length}`);
  }
  if (opts.search?.trim()) {
    values.push(`%${opts.search.trim().toLowerCase()}%`);
    const i = values.length;
    where.push(
      `(lower(email) LIKE $${i} OR lower(company_name) LIKE $${i} OR lower(contact_name) LIKE $${i})`
    );
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countRes = await db().query<{ count: string }>(
    `SELECT count(*)::text AS count FROM em_recipients ${clause}`,
    values
  );

  values.push(opts.limit ?? 200, opts.offset ?? 0);
  const { rows } = await db().query<RecipientRow>(
    `SELECT ${RECIPIENT_COLUMNS} FROM em_recipients ${clause}
     ORDER BY created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return { rows: rows.map(mapRecipient), total: Number(countRes.rows[0]?.count ?? 0) };
}

export async function getRecipientsByIds(ids: string[]): Promise<Recipient[]> {
  if (!ids.length) return [];
  const { rows } = await db().query<RecipientRow>(
    `SELECT ${RECIPIENT_COLUMNS} FROM em_recipients WHERE id = ANY($1::uuid[])`,
    [ids]
  );
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows
    .map(mapRecipient)
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function listRecipientIdsByStatus(status: RecipientStatus): Promise<string[]> {
  const { rows } = await db().query<{ id: string }>(
    `SELECT id FROM em_recipients
      WHERE status = $1 AND opted_out = FALSE
        AND (domain_status IS NULL OR domain_status <> 'invalid')
      ORDER BY created_at ASC`,
    [status]
  );
  return rows.map((r) => r.id);
}

export type RecipientInput = {
  email: string;
  companyName?: string;
  contactName?: string;
  industry?: string;
  notes?: string;
};

/** Inserts new addresses and updates details on existing ones, never resetting send state. */
export async function upsertRecipients(
  inputs: RecipientInput[]
): Promise<{ inserted: number; updated: number; skipped: number }> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const input of inputs) {
    const email = input.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      skipped++;
      continue;
    }
    const { rows } = await db().query<{ inserted: boolean }>(
      `INSERT INTO em_recipients (email, company_name, contact_name, industry, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (lower(email)) DO UPDATE SET
         company_name = COALESCE(NULLIF(EXCLUDED.company_name, ''), em_recipients.company_name),
         contact_name = COALESCE(NULLIF(EXCLUDED.contact_name, ''), em_recipients.contact_name),
         industry     = COALESCE(NULLIF(EXCLUDED.industry, ''), em_recipients.industry),
         notes        = COALESCE(NULLIF(EXCLUDED.notes, ''), em_recipients.notes),
         updated_at   = now()
       RETURNING (xmax = 0) AS inserted`,
      [
        email,
        input.companyName?.trim() ?? "",
        input.contactName?.trim() ?? "",
        input.industry?.trim() ?? "",
        input.notes?.trim() ?? "",
      ]
    );
    if (rows[0]?.inserted) inserted++;
    else updated++;
  }

  return { inserted, updated, skipped };
}

export async function deleteRecipients(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  const res = await db().query("DELETE FROM em_recipients WHERE id = ANY($1::uuid[])", [ids]);
  return res.rowCount ?? 0;
}

export async function setOptedOut(ids: string[], optedOut: boolean): Promise<number> {
  if (!ids.length) return 0;
  const res = await db().query(
    `UPDATE em_recipients
        SET opted_out = $2, opted_out_at = CASE WHEN $2 THEN now() ELSE NULL END, updated_at = now()
      WHERE id = ANY($1::uuid[])`,
    [ids, optedOut]
  );
  return res.rowCount ?? 0;
}

export async function setRecipientStatus(
  ids: string[],
  status: RecipientStatus,
  reason = ""
): Promise<number> {
  if (!ids.length) return 0;
  const res = await db().query(
    `UPDATE em_recipients
        SET status = $2,
            replied_at   = CASE WHEN $2 = 'replied' THEN now() ELSE replied_at END,
            bounced_at   = CASE WHEN $2 = 'bounced' THEN now() ELSE bounced_at END,
            bounce_reason = CASE WHEN $2 = 'bounced' THEN $3 ELSE bounce_reason END,
            updated_at = now()
      WHERE id = ANY($1::uuid[])`,
    [ids, status, reason]
  );
  return res.rowCount ?? 0;
}

export async function setDomainStatus(
  id: string,
  status: DomainStatus
): Promise<void> {
  await db().query(
    `UPDATE em_recipients SET domain_status = $2, domain_checked_at = now(), updated_at = now()
      WHERE id = $1`,
    [id, status]
  );
}

export async function listRecipientsNeedingAudit(limit: number): Promise<Recipient[]> {
  const { rows } = await db().query<RecipientRow>(
    `SELECT ${RECIPIENT_COLUMNS} FROM em_recipients
      WHERE domain_status IS NULL OR domain_status = 'unknown'
      ORDER BY created_at ASC LIMIT $1`,
    [limit]
  );
  return rows.map(mapRecipient);
}

export async function updateRecipientAfterSend(
  id: string,
  templateType: EmailTemplateType,
  opts: { autoFollowUp: boolean }
): Promise<void> {
  const column =
    templateType === "initial"
      ? "initial_sent_at"
      : templateType === "follow_up_1"
        ? "follow_up_1_sent_at"
        : "follow_up_2_sent_at";

  await db().query(
    `UPDATE em_recipients
        SET status = CASE WHEN status = 'not_sent' THEN 'sent' ELSE status END,
            ${column} = now(),
            last_template_type = $2,
            auto_follow_up = CASE WHEN $3 THEN TRUE ELSE auto_follow_up END,
            updated_at = now()
      WHERE id = $1`,
    [id, templateType, opts.autoFollowUp]
  );
}

/**
 * Recipients whose follow-up is due. Anyone who replied, bounced or opted out
 * is excluded here as well as at send time.
 */
export async function listRecipientsForAutoFollowUp(): Promise<{
  followUp1: string[];
  followUp2: string[];
}> {
  const base = `FROM em_recipients
    WHERE auto_follow_up = TRUE AND opted_out = FALSE
      AND status = 'sent'
      AND (domain_status IS NULL OR domain_status <> 'invalid')`;

  const one = await db().query<{ id: string }>(
    `SELECT id ${base}
       AND initial_sent_at IS NOT NULL
       AND follow_up_1_sent_at IS NULL
       AND initial_sent_at < now() - ($1 || ' days')::interval`,
    [FOLLOW_UP_1_AFTER_DAYS]
  );

  const two = await db().query<{ id: string }>(
    `SELECT id ${base}
       AND follow_up_1_sent_at IS NOT NULL
       AND follow_up_2_sent_at IS NULL
       AND follow_up_1_sent_at < now() - ($1 || ' days')::interval`,
    [FOLLOW_UP_2_AFTER_DAYS - FOLLOW_UP_1_AFTER_DAYS]
  );

  return { followUp1: one.rows.map((r) => r.id), followUp2: two.rows.map((r) => r.id) };
}

/* -------------------------------- templates ------------------------------- */

export async function getTemplate(
  templateType: EmailTemplateType
): Promise<CampaignTemplate | null> {
  const { rows } = await db().query<{
    template_type: EmailTemplateType;
    subject: string;
    body_html: string;
    updated_at: Date;
  }>(
    "SELECT template_type, subject, body_html, updated_at FROM em_templates WHERE template_type = $1",
    [templateType]
  );
  const r = rows[0];
  return r
    ? {
        templateType: r.template_type,
        subject: r.subject,
        bodyHtml: r.body_html,
        updatedAt: r.updated_at.toISOString(),
      }
    : null;
}

export async function listTemplates(): Promise<CampaignTemplate[]> {
  const { rows } = await db().query<{
    template_type: EmailTemplateType;
    subject: string;
    body_html: string;
    updated_at: Date;
  }>("SELECT template_type, subject, body_html, updated_at FROM em_templates ORDER BY template_type");
  return rows.map((r) => ({
    templateType: r.template_type,
    subject: r.subject,
    bodyHtml: r.body_html,
    updatedAt: r.updated_at.toISOString(),
  }));
}

export async function saveTemplate(t: {
  templateType: EmailTemplateType;
  subject: string;
  bodyHtml: string;
}): Promise<void> {
  await db().query(
    `INSERT INTO em_templates (template_type, subject, body_html, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (template_type) DO UPDATE
       SET subject = EXCLUDED.subject, body_html = EXCLUDED.body_html, updated_at = now()`,
    [t.templateType, t.subject, t.bodyHtml]
  );
}

/* ----------------------------- campaigns / logs ---------------------------- */

export async function createCampaign(params: {
  templateType: EmailTemplateType;
  autoFollowUp: boolean;
  recipientCount: number;
}): Promise<string> {
  const { rows } = await db().query<{ id: string }>(
    `INSERT INTO em_campaigns (template_type, auto_follow_up, recipient_count)
     VALUES ($1, $2, $3) RETURNING id`,
    [params.templateType, params.autoFollowUp, params.recipientCount]
  );
  return rows[0].id;
}

export async function appendSendLog(entry: {
  campaignId: string | null;
  recipientId: string | null;
  templateType: EmailTemplateType;
  email: string;
  status: SendLogStatus;
  errorMessage?: string;
}): Promise<void> {
  await db().query(
    `INSERT INTO em_send_logs (campaign_id, recipient_id, template_type, email, status, error_message)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      entry.campaignId,
      entry.recipientId,
      entry.templateType,
      entry.email,
      entry.status,
      entry.errorMessage ?? "",
    ]
  );
}

export async function listSendLogs(limit = 100) {
  const { rows } = await db().query<{
    id: string;
    email: string;
    template_type: EmailTemplateType;
    status: SendLogStatus;
    error_message: string;
    sent_at: Date;
  }>(
    `SELECT id, email, template_type, status, error_message, sent_at
       FROM em_send_logs ORDER BY sent_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    templateType: r.template_type,
    status: r.status,
    errorMessage: r.error_message,
    sentAt: r.sent_at.toISOString(),
  }));
}

export async function updateCampaignCounts(
  campaignId: string,
  sent: number,
  failed: number
): Promise<void> {
  await db().query(
    "UPDATE em_campaigns SET sent_count = $1, failed_count = $2 WHERE id = $3",
    [sent, failed, campaignId]
  );
}

export async function recipientStats(): Promise<Record<string, number>> {
  const { rows } = await db().query<{ status: string; count: string }>(
    "SELECT status, count(*)::text AS count FROM em_recipients GROUP BY status"
  );
  const out: Record<string, number> = { not_sent: 0, sent: 0, replied: 0, bounced: 0 };
  for (const r of rows) out[r.status] = Number(r.count);

  const extra = await db().query<{ opted_out: string; invalid: string }>(
    `SELECT
       count(*) FILTER (WHERE opted_out)::text AS opted_out,
       count(*) FILTER (WHERE domain_status = 'invalid')::text AS invalid
     FROM em_recipients`
  );
  out.opted_out = Number(extra.rows[0]?.opted_out ?? 0);
  out.invalid_domain = Number(extra.rows[0]?.invalid ?? 0);
  return out;
}
