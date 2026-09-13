import { requireAdmin } from "@/lib/campaigns/guard";
import {
  deleteRecipients,
  listRecipients,
  recipientStats,
  setOptedOut,
  setRecipientStatus,
  upsertRecipients,
  type RecipientInput,
} from "@/lib/campaigns/store";
import type { RecipientStatus } from "@/lib/campaigns/types";

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = new URL(request.url);
  try {
    const [page, stats] = await Promise.all([
      listRecipients({
        limit: Number(url.searchParams.get("limit") ?? 200),
        offset: Number(url.searchParams.get("offset") ?? 0),
        status: (url.searchParams.get("status") as RecipientStatus | "all") ?? "all",
        search: url.searchParams.get("search") ?? "",
      }),
      recipientStats(),
    ]);
    return Response.json({ ...page, stats });
  } catch (err) {
    return Response.json({ error: message(err) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as {
      action?: "import" | "delete" | "opt_out" | "opt_in" | "set_status";
      recipients?: RecipientInput[];
      ids?: string[];
      status?: RecipientStatus;
      reason?: string;
    };

    switch (body.action) {
      case "delete":
        return Response.json({ affected: await deleteRecipients(body.ids ?? []) });
      case "opt_out":
        return Response.json({ affected: await setOptedOut(body.ids ?? [], true) });
      case "opt_in":
        return Response.json({ affected: await setOptedOut(body.ids ?? [], false) });
      case "set_status":
        return Response.json({
          affected: await setRecipientStatus(
            body.ids ?? [],
            body.status ?? "not_sent",
            body.reason ?? ""
          ),
        });
      default:
        return Response.json(await upsertRecipients(body.recipients ?? []));
    }
  } catch (err) {
    return Response.json({ error: message(err) }, { status: 400 });
  }
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : "Unexpected error";
}
