import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { defaultDocuments } from "@/content/documents";
import { getPool, isDatabaseConfigured } from "@/lib/db/client";
import type { DocumentBundle } from "./types";

const ROW_ID = "default";
const LOCAL_FILE = join(process.cwd(), ".data", "documents.json");

/**
 * Storage resolution order:
 *   1. Postgres, when DATABASE_URL is set — the only option that persists on Vercel.
 *   2. A local JSON file, for development before a database exists.
 *   3. The seed content in content/documents.ts.
 *
 * Vercel's filesystem is read-only at runtime, so step 2 cannot work in
 * production; `canPersist()` reports that honestly to the admin UI rather than
 * letting a save appear to succeed and silently vanish.
 */
export function canPersist(): boolean {
  return isDatabaseConfigured() || process.env.NODE_ENV !== "production";
}

export function persistenceMode(): "database" | "local-file" | "read-only" {
  if (isDatabaseConfigured()) return "database";
  return process.env.NODE_ENV === "production" ? "read-only" : "local-file";
}

async function readLocal(): Promise<DocumentBundle | null> {
  try {
    return JSON.parse(await readFile(LOCAL_FILE, "utf8")) as DocumentBundle;
  } catch {
    return null;
  }
}

export async function getDocuments(): Promise<DocumentBundle> {
  const pool = getPool();

  if (pool) {
    try {
      const { rows } = await pool.query<{ bundle: DocumentBundle }>(
        "SELECT bundle FROM site_documents WHERE id = $1",
        [ROW_ID]
      );
      if (rows[0]?.bundle) return rows[0].bundle;
    } catch (err) {
      // A missing table or an unreachable database must not take the site down;
      // the public pages fall back to the seed content.
      console.error("[documents] database read failed, using defaults:", err);
    }
    return defaultDocuments;
  }

  return (await readLocal()) ?? defaultDocuments;
}

export async function saveDocuments(bundle: DocumentBundle): Promise<void> {
  const pool = getPool();

  if (pool) {
    await pool.query(
      `INSERT INTO site_documents (id, bundle, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (id) DO UPDATE
         SET bundle = EXCLUDED.bundle, updated_at = now()`,
      [ROW_ID, JSON.stringify(bundle)]
    );
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "No DATABASE_URL is configured. Add one in the Vercel project settings — " +
        "the serverless filesystem is read-only, so edits cannot be saved without a database."
    );
  }

  await mkdir(dirname(LOCAL_FILE), { recursive: true });
  await writeFile(LOCAL_FILE, JSON.stringify(bundle, null, 2), "utf8");
}
