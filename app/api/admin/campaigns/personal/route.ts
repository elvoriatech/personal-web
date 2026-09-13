import { requireAdmin } from "@/lib/campaigns/guard";
import type { AttachmentId } from "@/lib/campaigns/attachments";
import { sendPersonalEmail } from "@/lib/campaigns/personal";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as {
      to?: string;
      subject?: string;
      body?: string;
      attachments?: AttachmentId[];
      ccSelf?: boolean;
    };

    const result = await sendPersonalEmail({
      to: body.to ?? "",
      subject: body.subject ?? "",
      body: body.body ?? "",
      attachments: body.attachments ?? [],
      ccSelf: body.ccSelf ?? true,
    });

    return Response.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
