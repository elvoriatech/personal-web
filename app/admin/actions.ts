"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSession,
  destroySession,
  isAuthConfigured,
  verifyPassword,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";
import { getDocuments, saveDocuments } from "@/lib/documents/store";
import { PHOTO_DATA_URL_RE, PHOTO_MAX_CHARS } from "@/lib/documents/photo";
import type { CoverLetterDoc, EmailTemplate, ResumeDoc } from "@/lib/documents/types";

export type AuthState = { error: string };
export type SaveState = { status: "idle" | "saved" | "error"; message: string };

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isAuthConfigured()) {
    return {
      error:
        "Admin access is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET, then restart.",
    };
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`login:${ip}`).ok) {
    return { error: "Too many attempts. Wait a minute and try again." };
  }

  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    return { error: "Incorrect password." };
  }

  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/** Every save goes through here so the whole bundle stays internally consistent. */
async function persist(
  mutate: (bundle: Awaited<ReturnType<typeof getDocuments>>) => void
): Promise<SaveState> {
  try {
    const bundle = await getDocuments();
    mutate(bundle);
    await saveDocuments(bundle);
    revalidatePath("/resume");
    revalidatePath("/cover-letter");
    revalidatePath("/admin", "layout");
    return { status: "saved", message: "Saved." };
  } catch (err) {
    console.error("[admin] save failed:", err);
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Could not save.",
    };
  }
}

export async function saveResume(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  const raw = String(formData.get("payload") ?? "");
  let parsed: ResumeDoc;
  try {
    parsed = JSON.parse(raw) as ResumeDoc;
  } catch {
    return { status: "error", message: "The editor sent malformed data." };
  }
  // The photo is the one field a browser can make arbitrarily large or odd.
  if (parsed.photoDataUrl) {
    if (parsed.photoDataUrl.length > PHOTO_MAX_CHARS) {
      return { status: "error", message: "The photo is too large. Upload it again so it is resized." };
    }
    if (!PHOTO_DATA_URL_RE.test(parsed.photoDataUrl)) {
      return { status: "error", message: "The photo must be a JPEG or PNG." };
    }
  }
  if (parsed.preferredVariant && parsed.preferredVariant !== "ats" && parsed.preferredVariant !== "design") {
    return { status: "error", message: "Unknown résumé template." };
  }
  return persist((bundle) => {
    bundle.resume = parsed;
  });
}

export async function saveCoverLetter(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  const raw = String(formData.get("payload") ?? "");
  let parsed: CoverLetterDoc;
  try {
    parsed = JSON.parse(raw) as CoverLetterDoc;
  } catch {
    return { status: "error", message: "The editor sent malformed data." };
  }
  return persist((bundle) => {
    bundle.coverLetter = parsed;
  });
}

export async function saveTemplates(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  const raw = String(formData.get("payload") ?? "");
  let parsed: EmailTemplate[];
  try {
    parsed = JSON.parse(raw) as EmailTemplate[];
  } catch {
    return { status: "error", message: "The editor sent malformed data." };
  }
  return persist((bundle) => {
    bundle.emailTemplates = parsed;
  });
}

/* ------------------------------- blog posts ------------------------------- */

export async function savePost(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  const { upsertPost } = await import("@/lib/blog/store");
  const { slugify } = await import("@/lib/blog/types");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { status: "error", message: "A title is required." };

  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const publishedAt =
    String(formData.get("publishedAt") ?? "").trim() ||
    new Date().toISOString().slice(0, 10);

  try {
    await upsertPost({
      slug,
      title,
      excerpt: String(formData.get("excerpt") ?? "").trim(),
      body: String(formData.get("body") ?? ""),
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      publishedAt,
      draft: formData.get("draft") === "on",
    });
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/admin/blog");
    return { status: "saved", message: `Saved "${title}".` };
  } catch (err) {
    console.error("[admin] post save failed:", err);
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Could not save the post.",
    };
  }
}

export async function removePost(formData: FormData): Promise<void> {
  const { deletePost } = await import("@/lib/blog/store");
  const slug = String(formData.get("slug") ?? "");
  if (slug) {
    await deletePost(slug);
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
  }
}
