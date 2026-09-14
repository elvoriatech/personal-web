import { requireAdmin } from "@/lib/campaigns/guard";
import { verifyMailer } from "@/lib/campaigns/mailer";
import { coerceTransportChoice } from "@/lib/mail/transports";

/** Checks a sending account without sending anything. Body: { via?: transport }. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as { via?: string };
  return Response.json(await verifyMailer(coerceTransportChoice(body.via)));
}
