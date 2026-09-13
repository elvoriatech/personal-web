import { requireAdmin } from "@/lib/campaigns/guard";
import { fromAddress, mailerMode, verifyMailer } from "@/lib/campaigns/mailer";

/** Checks the SMTP login without sending anything. */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const result = await verifyMailer();
  return Response.json({
    ...result,
    mode: mailerMode(),
    from: mailerMode() === "unconfigured" ? "" : fromAddress(),
  });
}
