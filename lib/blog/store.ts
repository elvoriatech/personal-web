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
  tags: string[];
  published_at: Date | string;
  draft: boolean;
};

function fromRow(r: Row): BlogPost {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    tags: r.tags ?? [],
    publishedAt:
      typeof r.published_at === "string"
        ? r.published_at.slice(0, 10)
        : r.published_at.toISOString().slice(0, 10),
    draft: r.draft,
  };
}

async function readLocal(): Promise<BlogPost[]> {
  try {
    return JSON.parse(await readFile(LOCAL_FILE, "utf8")) as BlogPost[];
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
}: { includeDrafts?: boolean } = {}): Promise<BlogPost[]> {
  const pool = getPool();

  if (pool) {
    try {
      const { rows } = await pool.query<Row>(
        `SELECT slug, title, excerpt, body, tags, published_at, draft
           FROM blog_posts
          ${includeDrafts ? "" : "WHERE draft = FALSE"}
          ORDER BY published_at DESC, slug`
      );
      return rows.map(fromRow);
    } catch (err) {
      console.error("[blog] database read failed:", err);
      return [];
    }
  }

  const posts = await readLocal();
  return posts.filter((p) => includeDrafts || !p.draft).sort(byNewest);
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const pool = getPool();

  if (pool) {
    try {
      const { rows } = await pool.query<Row>(
        `SELECT slug, title, excerpt, body, tags, published_at, draft
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
      `INSERT INTO blog_posts (slug, title, excerpt, body, tags, published_at, draft, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         excerpt = EXCLUDED.excerpt,
         body = EXCLUDED.body,
         tags = EXCLUDED.tags,
         published_at = EXCLUDED.published_at,
         draft = EXCLUDED.draft,
         updated_at = now()`,
      [post.slug, post.title, post.excerpt, post.body, post.tags, post.publishedAt, post.draft]
    );
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "No DATABASE_URL is configured — posts cannot be saved on a read-only filesystem."
    );
  }

  const posts = await readLocal();
  const next = posts.filter((p) => p.slug !== post.slug);
  next.push(post);
  await writeLocal(next.sort(byNewest));
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
