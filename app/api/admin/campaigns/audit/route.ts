import { requireAdmin } from "@/lib/campaigns/guard";
import { checkEmailDomain } from "@/lib/campaigns/domainCheck";
import { listRecipientsNeedingAudit, setDomainStatus } from "@/lib/campaigns/store";

/** Audits a slice of un-checked recipients. Call repeatedly until checked is 0. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { limit = 40 } = (await request.json().catch(() => ({}))) as { limit?: number };
    const pending = await listRecipientsNeedingAudit(Math.min(Math.max(limit, 1), 100));

    const tally = { ok: 0, ok_fallback: 0, invalid: 0, unknown: 0 };
    // DNS lookups are independent, so run them together rather than serially.
    const results = await Promise.all(
      pending.map(async (r) => ({ id: r.id, result: await checkEmailDomain(r.email) }))
    );
    for (const { id, result } of results) {
      await setDomainStatus(id, result.status);
      tally[result.status]++;
    }

    return Response.json({ checked: pending.length, ...tally });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 400 }
    );
  }
}
