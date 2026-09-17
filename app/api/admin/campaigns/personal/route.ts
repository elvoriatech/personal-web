import { requireAdmin } from "@/lib/campaigns/guard";
import type { AttachmentId } from "@/lib/campaigns/attachments";
import { sendPersonalEmail } from "@/lib/campaigns/personal";
import { coerceEmailTheme } from "@/lib/campaigns/themes";
import { coerceTransportChoice } from "@/lib/mail/transports";
import { coerceDocumentFormat } from "@/lib/documents/types";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as {
      to?: string;
      subject?: string;
      body?: string;
      attachments?: AttachmentId[];
      attachmentFormat?: string;
      ccSelf?: boolean;
      theme?: string;
      via?: string;
    };

    const result = await sendPersonalEmail({
      to: body.to ?? "",
      subject: body.subject ?? "",
      body: body.body ?? "",
      attachments: body.attachments ?? [],
      attachmentFormat: coerceDocumentFormat(body.attachmentFormat),
      ccSelf: body.ccSelf ?? true,
      theme: coerceEmailTheme(body.theme),
      via: coerceTransportChoice(body.via),
    });

    return Response.json(result, { status: result.ok ? 200 : 400 });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
