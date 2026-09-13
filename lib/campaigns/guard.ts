import "server-only";

import { isSignedIn } from "@/lib/auth";

/** Returns a 401 Response when the caller has no admin session, else null. */
export async function requireAdmin(): Promise<Response | null> {
  if (await isSignedIn()) return null;
  return Response.json({ error: "Not authorised" }, { status: 401 });
}

/**
 * Cron endpoints authenticate with a shared secret instead of a cookie.
 * Vercel Cron sends it as `Authorization: Bearer <CRON_SECRET>`.
 */
export function requireCronSecret(request: Request): Response | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== expected) {
    return Response.json({ error: "Not authorised" }, { status: 401 });
  }
  return null;
}
