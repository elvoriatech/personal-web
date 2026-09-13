import { requireAdmin } from "@/lib/campaigns/guard";
import {
  cancelSendJob,
  createSendJob,
  getActiveSendJob,
  processSendJobBatch,
} from "@/lib/campaigns/jobs";
import { seedTemplatesIfMissing } from "@/lib/campaigns/seed";
import type { EmailTemplateType, SendJobSelectionMode } from "@/lib/campaigns/types";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return Response.json({ job: await getActiveSendJob() });
  } catch (err) {
    return Response.json({ error: message(err) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as {
      action?: "create" | "cancel" | "process";
      jobId?: string;
      templateType?: EmailTemplateType;
      autoFollowUp?: boolean;
      selectionMode?: SendJobSelectionMode;
      recipientIds?: string[];
    };

    if (body.action === "cancel") {
      if (!body.jobId) return Response.json({ error: "jobId is required" }, { status: 400 });
      return Response.json({ job: await cancelSendJob(body.jobId) });
    }

    if (body.action === "process") {
      return Response.json(await processSendJobBatch());
    }

    await seedTemplatesIfMissing();
    const job = await createSendJob({
      templateType: body.templateType ?? "initial",
      autoFollowUp: body.autoFollowUp ?? false,
      selectionMode: body.selectionMode ?? "all_not_sent",
      recipientIds: body.recipientIds,
    });
    return Response.json({ job });
  } catch (err) {
    return Response.json({ error: message(err) }, { status: 400 });
  }
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : "Unexpected error";
}
