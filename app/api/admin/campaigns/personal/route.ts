import { requireAdmin } from "@/lib/campaigns/guard";
import type { AttachmentId } from "@/lib/campaigns/attachments";
import { sendPersonalEmail } from "@/lib/campaigns/personal";
import { coerceEmailTheme } from "@/lib/campaigns/themes";

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
      theme?: string;
    };

    const result = await sendPersonalEmail({
      to: body.to ?? "",
      subject: body.subject ?? "",
      body: body.body ?? "",
      attachments: body.attachments ?? [],
      ccSelf: body.ccSelf ?? true,
      theme: coerceEmailTheme(body.theme),
    });

    return Response.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
