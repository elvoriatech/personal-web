import "server-only";

import { createHash } from "node:crypto";
import sharp from "sharp";
import { getPool } from "@/lib/db/client";

export const IMAGE_MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
/** Longest edge after resizing; wide enough for a 68ch column on a 2× display. */
const MAX_EDGE = 1600;

export type StoredImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  contentType: string;
};

export class ImagesNotConfiguredError extends Error {
  constructor() {
    super("Image uploads need a database. Set DATABASE_URL and apply lib/db/schema.sql.");
  }
}

/**
 * Normalises an upload and stores it. Every image becomes a WebP no wider than
 * MAX_EDGE (animated GIFs keep their frames), EXIF is dropped, and the id is a
 * hash of the final bytes — so re-uploading the same picture is a no-op and
 * the public URL is safe to cache forever.
 */
export async function storeImage(input: Buffer, originalType: string): Promise<StoredImage> {
  const pool = getPool();
  if (!pool) throw new ImagesNotConfiguredError();
  if (!originalType.startsWith("image/")) throw new Error("Only image files can be uploaded.");

  const animated = originalType === "image/gif";
  const pipeline = sharp(input, { animated })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 });
  const data = await pipeline.toBuffer();
  const meta = await sharp(data, { animated }).metadata();
  const width = meta.width ?? 0;
  // For animated output sharp reports the full strip height; pageHeight is one frame.
  const height = meta.pageHeight ?? meta.height ?? 0;

  const id = createHash("sha256").update(data).digest("hex").slice(0, 32);
  await pool.query(
    `INSERT INTO blog_images (id, data, content_type, width, height, bytes)
     VALUES ($1, $2, 'image/webp', $3, $4, $5)
     ON CONFLICT (id) DO NOTHING`,
    [id, data, width, height, data.length]
  );

  return { id, url: `/api/blog/images/${id}`, width, height, bytes: data.length, contentType: "image/webp" };
}

export async function getImage(id: string): Promise<{ data: Buffer; contentType: string } | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<{ data: Buffer; content_type: string }>(
    "SELECT data, content_type FROM blog_images WHERE id = $1",
    [id]
  );
  return rows[0] ? { data: rows[0].data, contentType: rows[0].content_type } : null;
}
