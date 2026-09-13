import { Pool } from "pg";

/**
 * A single lazily-created pool. Returns null when DATABASE_URL is unset, which
 * is the signal for callers to fall back to local file storage in development.
 */
let pool: Pool | null = null;

export function getPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 30_000,
      // Most hosted Postgres (Neon, Supabase, Vercel) terminates TLS with a
      // certificate the Node default chain rejects; sslmode is in the URL.
      ssl: connectionString.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
