import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getPool } from "@/lib/db/client";
import type { BlogPost } from "./types";

const LOCAL_FILE = join(process.cwd(), ".data", "posts.json");

type Row = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  tags: string[];
  published_at: Date | string;
  draft: boolean;
  archived_at: Date | string | null;
};

function fromRow(r: Row): BlogPost {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    coverImage: r.cover_image ?? "",
    tags: r.tags ?? [],
    publishedAt:
      typeof r.published_at === "string"
        ? r.published_at.slice(0, 10)
        : r.published_at.toISOString().slice(0, 10),
    draft: r.draft,
    archivedAt: r.archived_at ? (typeof r.archived_at === "string" ? r.archived_at : r.archived_at.toISOString()).slice(0, 10) : null,
  };
}

async function readLocal(): Promise<BlogPost[]> {
  try {
    const posts = JSON.parse(await readFile(LOCAL_FILE, "utf8")) as Partial<BlogPost>[];
    return posts.map((p) => ({ coverImage: "", ...p }) as BlogPost);
  } catch {
    return [];
  }
}

async function writeLocal(posts: BlogPost[]): Promise<void> {
  await mkdir(dirname(LOCAL_FILE), { recursive: true });
  await writeFile(LOCAL_FILE, JSON.stringify(posts, null, 2), "utf8");
}

const byNewest = (a: BlogPost, b: BlogPost) =>
  b.publishedAt.localeCompare(a.publishedAt);

export async function listPosts({
  includeDrafts = false,
  includeArchived = false,
}: { includeDrafts?: boolean; includeArchived?: boolean } = {}): Promise<BlogPost[]> {
  const pool = getPool();

  if (pool) {
    try {
      const where = [
        includeDrafts ? null : "draft = FALSE",
        includeArchived ? null : "archived_at IS NULL",
      ].filter(Boolean);
      const { rows } = await pool.query<Row>(
        `SELECT slug, title, excerpt, body, cover_image, tags, published_at, draft, archived_at
           FROM blog_posts
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY published_at DESC, slug`
      );
      return rows.map(fromRow);
    } catch (err) {
      console.error("[blog] database read failed:", err);
      return [];
    }
  }

  const posts = await readLocal();
  return posts
    .filter((p) => (includeDrafts || !p.draft) && (includeArchived || !p.archivedAt))
    .sort(byNewest);
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const pool = getPool();

  if (pool) {
    try {
      const { rows } = await pool.query<Row>(
        `SELECT slug, title, excerpt, body, cover_image, tags, published_at, draft, archived_at
           FROM blog_posts WHERE slug = $1`,
        [slug]
      );
      return rows[0] ? fromRow(rows[0]) : null;
    } catch (err) {
      console.error("[blog] database read failed:", err);
      return null;
    }
  }

  return (await readLocal()).find((p) => p.slug === slug) ?? null;
}

export async function upsertPost(post: BlogPost): Promise<void> {
  const pool = getPool();

  if (pool) {
    await pool.query(
      `INSERT INTO blog_posts (slug, title, excerpt, body, cover_image, tags, published_at, draft, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         excerpt = EXCLUDED.excerpt,
         body = EXCLUDED.body,
         cover_image = EXCLUDED.cover_image,
         tags = EXCLUDED.tags,
         published_at = EXCLUDED.published_at,
         draft = EXCLUDED.draft,
         updated_at = now()`,
      [post.slug, post.title, post.excerpt, post.body, post.coverImage, post.tags, post.publishedAt, post.draft]
    );
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "No DATABASE_URL is configured — posts cannot be saved on a read-only filesystem."
    );
  }

  const posts = await readLocal();
  const existing = posts.find((p) => p.slug === post.slug);
  const next = posts.filter((p) => p.slug !== post.slug);
  // A save from the editor must not silently un-archive a post.
  next.push({ ...post, archivedAt: post.archivedAt ?? existing?.archivedAt ?? null });
  await writeLocal(next.sort(byNewest));
}

/** Archive (hide but keep) or restore a post. */
export async function setPostArchived(slug: string, archived: boolean): Promise<void> {
  const pool = getPool();
  if (pool) {
    await pool.query(
      `UPDATE blog_posts SET archived_at = ${archived ? "now()" : "NULL"}, updated_at = now() WHERE slug = $1`,
      [slug]
    );
    return;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("No DATABASE_URL is configured — posts cannot be changed.");
  }
  const posts = await readLocal();
  await writeLocal(
    posts.map((p) =>
      p.slug === slug ? { ...p, archivedAt: archived ? new Date().toISOString().slice(0, 10) : null } : p
    )
  );
}

export async function deletePost(slug: string): Promise<void> {
  const pool = getPool();
  if (pool) {
    await pool.query("DELETE FROM blog_posts WHERE slug = $1", [slug]);
    return;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("No DATABASE_URL is configured — posts cannot be deleted.");
  }
  await writeLocal((await readLocal()).filter((p) => p.slug !== slug));
}
