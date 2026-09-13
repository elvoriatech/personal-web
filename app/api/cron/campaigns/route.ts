import { requireCronSecret } from "@/lib/campaigns/guard";
import { createSendJob, getActiveSendJob, processSendJobBatch } from "@/lib/campaigns/jobs";
import {
  isCampaignsConfigured,
  latestCampaignTheme,
  listRecipientsForAutoFollowUp,
} from "@/lib/campaigns/store";
import { DEFAULT_CAMPAIGN_THEME } from "@/lib/campaigns/themes";

export const maxDuration = 60;

/**
 * Cron worker. Drains the active send job a batch at a time, and queues the
 * follow-ups that have come due once nothing else is running.
 *
 * It deliberately stops well before the function timeout rather than trying to
 * finish a whole campaign: the next tick picks up exactly where it left off,
 * because progress is stored in `processed_index`.
 */
export async function GET(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  if (!isCampaignsConfigured()) {
    return Response.json({ skipped: "no DATABASE_URL" });
  }

  const startedAt = Date.now();
  const BUDGET_MS = 45_000;
  let batches = 0;
  let sent = 0;
  let failed = 0;

  try {
    while (Date.now() - startedAt < BUDGET_MS) {
      const result = await processSendJobBatch();
      if (!result.ran) break;
      batches++;
      sent += result.batchSent;
      failed += result.batchFailed;
      if (result.job && result.job.status !== "running") break;
    }

    let queuedFollowUps: { followUp1: number; followUp2: number } | null = null;
    if (!(await getActiveSendJob())) {
      const due = await listRecipientsForAutoFollowUp();
      queuedFollowUps = { followUp1: 0, followUp2: 0 };
      // Follow-ups inherit the look of the initial send, so a plain-letter
      // thread does not suddenly turn into a branded card.
      const theme = (await latestCampaignTheme("initial")) ?? DEFAULT_CAMPAIGN_THEME;

      // Only one job can run at a time, so queue the earlier stage first and
      // let the next tick pick up the other.
      if (due.followUp1.length) {
        await createSendJob({
          templateType: "follow_up_1",
          autoFollowUp: true,
          theme,
          selectionMode: "recipient_ids",
          recipientIds: due.followUp1,
        });
        queuedFollowUps.followUp1 = due.followUp1.length;
      } else if (due.followUp2.length) {
        await createSendJob({
          templateType: "follow_up_2",
          autoFollowUp: false,
          theme,
          selectionMode: "recipient_ids",
          recipientIds: due.followUp2,
        });
        queuedFollowUps.followUp2 = due.followUp2.length;
      }
    }

    return Response.json({ batches, sent, failed, queuedFollowUps });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
