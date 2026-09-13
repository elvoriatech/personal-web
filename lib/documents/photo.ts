import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import type { PhotoShape, ResumeDoc } from "./types";

export type ResumePhoto = {
  data: Buffer;
  /** docx-js needs the format spelled out; browsers want a MIME type. */
  type: "jpg" | "png";
  contentType: "image/jpeg" | "image/png";
};

const BUNDLED_PORTRAIT = join(process.cwd(), "assets", "zahoor-portrait.jpg");

/** Matches what the admin uploader produces and what the save action accepts. */
export const PHOTO_DATA_URL_RE = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=]+)$/;

/** Roughly 400 KB of base64 — plenty for a 512px JPEG, small enough for JSONB. */
export const PHOTO_MAX_CHARS = 400_000;

/**
 * The photo the two-column résumé should carry.
 *   - `photoDataUrl` set   → the uploaded image.
 *   - `photoDataUrl` ""    → the admin chose "no photo".
 *   - `photoDataUrl` unset → the portrait bundled with the site.
 */
export async function resolveResumePhoto(resume: ResumeDoc): Promise<ResumePhoto | null> {
  const raw = resume.photoDataUrl;
  if (raw === "") return null;

  if (raw) {
    const match = PHOTO_DATA_URL_RE.exec(raw);
    if (match) {
      const png = match[1] === "png";
      return {
        data: Buffer.from(match[2], "base64"),
        type: png ? "png" : "jpg",
        contentType: png ? "image/png" : "image/jpeg",
      };
    }
    // A malformed value falls through to the bundled portrait rather than
    // breaking the export.
  }

  try {
    return { data: await readFile(BUNDLED_PORTRAIT), type: "jpg", contentType: "image/jpeg" };
  } catch {
    return null;
  }
}

/** Pixels on each side of the embedded image — 110pt in the document at 4×. */
const SHAPED_SIZE = 440;

/**
 * The photo as it should be embedded in the .docx. Word cannot clip a picture
 * to a circle from docx-js, so circle and rounded crops are baked into a PNG
 * with a transparent mask; square passes the source through untouched.
 */
export async function shapedResumePhoto(
  resume: ResumeDoc
): Promise<ResumePhoto | null> {
  const photo = await resolveResumePhoto(resume);
  if (!photo) return null;
  const shape: PhotoShape = resume.photoShape ?? "square";
  if (shape === "square") return photo;

  const s = SHAPED_SIZE;
  const radius = shape === "circle" ? s / 2 : Math.round(s * 0.18);
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
  );
  const data = await sharp(photo.data)
    .rotate() // honour EXIF orientation before cropping
    .resize(s, s, { fit: "cover", position: "attention" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
  return { data, type: "png", contentType: "image/png" };
}
