import { requireAdmin } from "@/lib/campaigns/guard";
import { outreachVars, renderOutreachEmail } from "@/lib/campaigns/outreach";
import { sanitizeExtras } from "@/lib/campaigns/outreachVars";
import { getRecipient } from "@/lib/campaigns/store";
import { coerceEmailTheme } from "@/lib/campaigns/themes";

/**
 * Renders an outreach template for one real company, exactly as it will be
 * sent. Placeholders still unfilled come back highlighted as [name] rather
 * than silently replaced with sample text.
 *
 *   POST { subject, body, recipientId, extras?, theme? }
 */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as {
    subject?: string;
    body?: string;
    recipientId?: string;
    extras?: unknown;
    theme?: string;
  };
  const recipient = body.recipientId ? await getRecipient(body.recipientId) : null;
  if (!recipient) return new Response("That company is no longer in your list.", { status: 404 });

  const email = renderOutreachEmail({
    subject: body.subject ?? "",
    body: body.body ?? "",
    vars: outreachVars(recipient, sanitizeExtras(body.extras)),
    theme: coerceEmailTheme(body.theme),
    markMissing: true,
  });

  return new Response(email.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
