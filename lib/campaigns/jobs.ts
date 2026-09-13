import "server-only";

import { getPool } from "@/lib/db/client";
import { SEND_JOB_BATCH_SIZE } from "./constants";
import { sendBatchToRecipients } from "./send";
import {
  CampaignsNotConfiguredError,
  createCampaign,
  getRecipientsByIds,
  getTemplate,
  listRecipientIdsByStatus,
  updateCampaignCounts,
} from "./store";
import type {
  EmailTemplateType,
  SendJob,
  SendJobSelectionMode,
  SendJobStatus,
} from "./types";

type JobRow = {
  id: string;
  campaign_id: string | null;
  status: SendJobStatus;
  template_type: EmailTemplateType;
  auto_follow_up: boolean;
  selection_mode: SendJobSelectionMode;
  recipient_ids: string[];
  processed_index: number;
  total_count: number;
  sent_count: number;
  failed_count: number;
  last_error: string;
  created_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
};

function db() {
  const pool = getPool();
  if (!pool) throw new CampaignsNotConfiguredError();
  return pool;
}

const ACTIVE: SendJobStatus[] = ["queued", "running"];

function mapJob(r: JobRow): SendJob {
  return {
    id: r.id,
    campaignId: r.campaign_id,
    status: r.status,
    templateType: r.template_type,
    autoFollowUp: r.auto_follow_up,
    selectionMode: r.selection_mode,
    totalCount: r.total_count,
    processedIndex: r.processed_index,
    sentCount: r.sent_count,
    failedCount: r.failed_count,
    lastError: r.last_error,
    createdAt: r.created_at.toISOString(),
    startedAt: r.started_at ? r.started_at.toISOString() : null,
    completedAt: r.completed_at ? r.completed_at.toISOString() : null,
  };
}

function batchSize(): number {
  const raw = Number(process.env.EMAIL_JOB_BATCH_SIZE);
  if (Number.isFinite(raw) && raw > 0 && raw <= 100) return Math.floor(raw);
  return SEND_JOB_BATCH_SIZE;
}

export async function getActiveSendJob(): Promise<SendJob | null> {
  const { rows } = await db().query<JobRow>(
    "SELECT * FROM em_send_jobs WHERE status = ANY($1) ORDER BY created_at ASC LIMIT 1",
    [ACTIVE]
  );
  return rows[0] ? mapJob(rows[0]) : null;
}

export async function getSendJob(id: string): Promise<SendJob | null> {
  const { rows } = await db().query<JobRow>(
    "SELECT * FROM em_send_jobs WHERE id = $1 LIMIT 1",
    [id]
  );
  return rows[0] ? mapJob(rows[0]) : null;
}

export async function createSendJob(params: {
  templateType: EmailTemplateType;
  autoFollowUp: boolean;
  selectionMode: SendJobSelectionMode;
  recipientIds?: string[];
}): Promise<SendJob> {
  // One job at a time: two concurrent workers on the same list would double-send.
  const active = await getActiveSendJob();
  if (active) {
    throw new Error("A send job is already running. Wait for it to finish, or cancel it.");
  }

  const ids =
    params.selectionMode === "all_not_sent"
      ? await listRecipientIdsByStatus("not_sent")
      : [...new Set((params.recipientIds ?? []).filter(Boolean))];

  if (!ids.length) throw new Error("No eligible recipients to send to.");

  const campaignId = await createCampaign({
    templateType: params.templateType,
    autoFollowUp: params.autoFollowUp,
    recipientCount: ids.length,
  });

  const { rows } = await db().query<JobRow>(
    `INSERT INTO em_send_jobs
       (campaign_id, status, template_type, auto_follow_up, selection_mode, recipient_ids, total_count)
     VALUES ($1, 'queued', $2, $3, $4, $5::jsonb, $6)
     RETURNING *`,
    [
      campaignId,
      params.templateType,
      params.autoFollowUp,
      params.selectionMode,
      JSON.stringify(ids),
      ids.length,
    ]
  );
  return mapJob(rows[0]);
}

export async function cancelSendJob(id: string): Promise<SendJob | null> {
  const { rows } = await db().query<JobRow>(
    `UPDATE em_send_jobs
        SET status = 'cancelled', completed_at = now(), last_error = 'Cancelled by admin'
      WHERE id = $1 AND status = ANY($2)
      RETURNING *`,
    [id, ACTIVE]
  );
  return rows[0] ? mapJob(rows[0]) : getSendJob(id);
}

export type ProcessResult = {
  ran: boolean;
  job: SendJob | null;
  batchSent: number;
  batchFailed: number;
  batchSkipped: number;
};

/** Processes one batch of the oldest active job. Call repeatedly until `ran` is false. */
export async function processSendJobBatch(): Promise<ProcessResult> {
  const pool = db();
  const idle: ProcessResult = {
    ran: false,
    job: null,
    batchSent: 0,
    batchFailed: 0,
    batchSkipped: 0,
  };

  const { rows } = await pool.query<JobRow>(
    "SELECT * FROM em_send_jobs WHERE status = ANY($1) ORDER BY created_at ASC LIMIT 1",
    [ACTIVE]
  );
  const row = rows[0];
  if (!row) return idle;

  const job = mapJob(row);
  const ids: string[] = Array.isArray(row.recipient_ids) ? row.recipient_ids : [];

  const fail = async (message: string): Promise<ProcessResult> => {
    await pool.query(
      "UPDATE em_send_jobs SET status = 'failed', last_error = $1, completed_at = now() WHERE id = $2",
      [message, job.id]
    );
    return { ...idle, ran: true, job: await getSendJob(job.id) };
  };

  if (!job.campaignId) return fail("Missing campaign id");

  const template = await getTemplate(job.templateType);
  if (!template) return fail(`Template "${job.templateType}" not found`);

  if (job.status === "queued") {
    await pool.query(
      "UPDATE em_send_jobs SET status = 'running', started_at = now() WHERE id = $1",
      [job.id]
    );
  }

  const slice = ids.slice(job.processedIndex, job.processedIndex + batchSize());
  if (!slice.length) {
    await pool.query(
      "UPDATE em_send_jobs SET status = 'completed', completed_at = now() WHERE id = $1",
      [job.id]
    );
    await updateCampaignCounts(job.campaignId, job.sentCount, job.failedCount);
    return { ...idle, ran: true, job: await getSendJob(job.id) };
  }

  const recipients = await getRecipientsByIds(slice);
  const batch = await sendBatchToRecipients({
    recipients,
    template,
    templateType: job.templateType,
    autoFollowUp: job.autoFollowUp,
    campaignId: job.campaignId,
  });

  const processed = job.processedIndex + slice.length;
  const sent = job.sentCount + batch.sent;
  const failed = job.failedCount + batch.failed;
  const skipped =
    batch.skippedOptedOut + batch.skippedBounced + batch.skippedInvalidDomain;
  const done = processed >= ids.length;

  let note = batch.errors.slice(0, 2).join("; ");
  if (!note && skipped > 0) note = `${skipped} skipped by send-time guards`;

  await pool.query(
    `UPDATE em_send_jobs
        SET processed_index = $1, sent_count = $2, failed_count = $3,
            last_error = $4, status = $5, completed_at = $6
      WHERE id = $7`,
    [processed, sent, failed, note, done ? "completed" : "running", done ? new Date() : null, job.id]
  );
  await updateCampaignCounts(job.campaignId, sent, failed);

  return {
    ran: true,
    job: await getSendJob(job.id),
    batchSent: batch.sent,
    batchFailed: batch.failed,
    batchSkipped: skipped,
  };
}
