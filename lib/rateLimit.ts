/**
 * Best-effort in-memory rate limit.
 *
 * Serverless instances are ephemeral and not shared, so this throttles casual
 * abuse and accidental double-submits rather than a determined attacker. Move
 * to a shared store (Upstash, Vercel KV) if the form ever draws real traffic.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 3;

const hits = new Map<string, number[]>();

export function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    return { ok: false, retryAfter };
  }

  recent.push(now);
  hits.set(key, recent);

  /* Opportunistic cleanup so the map cannot grow without bound. */
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return { ok: true, retryAfter: 0 };
}
