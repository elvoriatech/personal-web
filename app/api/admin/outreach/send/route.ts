import { requireAdmin } from "@/lib/campaigns/guard";
import { sendOutreachToRecipient } from "@/lib/campaigns/outreach";
import { sanitizeExtras } from "@/lib/campaigns/outreachVars";
import { coerceEmailTheme } from "@/lib/campaigns/themes";
import { coerceTransportChoice } from "@/lib/mail/transports";

/** POST { templateId, subject, body, recipientId, extras?, theme?, via? } */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as {
      templateId?: string;
      subject?: string;
      body?: string;
      recipientId?: string;
      extras?: unknown;
      theme?: string;
      via?: string;
    };
    const result = await sendOutreachToRecipient({
      templateId: String(body.templateId ?? "").slice(0, 120),
      subject: body.subject ?? "",
      body: body.body ?? "",
      recipientId: body.recipientId ?? "",
      extras: sanitizeExtras(body.extras),
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
