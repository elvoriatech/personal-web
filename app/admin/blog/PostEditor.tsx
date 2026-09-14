"use client";

import { useActionState, useRef, useState } from "react";
import { savePost, type SaveState } from "../actions";
import { Card, Field, SaveBar } from "@/components/admin/Fields";
import { RichTextEditor, uploadBlogImage } from "@/components/admin/RichTextEditor";
import { slugify, type BlogPost } from "@/lib/blog/types";

const blank: BlogPost = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  coverImage: "",
  tags: [],
  publishedAt: new Date().toISOString().slice(0, 10),
  draft: true,
};

export function PostEditor({
  initial,
  canSave,
}: {
  /** Body already converted to HTML by the server page (legacy posts were plain text). */
  initial?: BlogPost;
  canSave: boolean;
}) {
  const [post, setPost] = useState<BlogPost>(initial ?? blank);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [state, action] = useActionState<SaveState, FormData>(savePost, {
    status: "idle",
    message: "",
  });

  const set = <K extends keyof BlogPost>(k: K, v: BlogPost[K]) =>
    setPost((p) => ({ ...p, [k]: v }));

  return (
    <form action={action}>
      <input type="hidden" name="slug" value={post.slug} />
      <input type="hidden" name="title" value={post.title} />
      <input type="hidden" name="publishedAt" value={post.publishedAt} />
      <input type="hidden" name="excerpt" value={post.excerpt} />
      <input type="hidden" name="body" value={post.body} />
      <input type="hidden" name="coverImage" value={post.coverImage} />
      <input type="hidden" name="tags" value={post.tags.join(", ")} />

      <div className="space-y-5">
        <Card title={initial ? `Editing “${initial.title}”` : "New post"}>
          <Field
            label="Title"
            value={post.title}
            onChange={(v) => {
              set("title", v);
              // Keep the slug in step until it has been edited by hand.
              if (!slugTouched) set("slug", slugify(v));
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Slug"
              value={post.slug}
              onChange={(v) => {
                setSlugTouched(true);
                set("slug", v);
              }}
              hint="The URL: /blog/<slug>"
            />
            <Field
              label="Publish date"
              type="date"
              value={post.publishedAt}
              onChange={(v) => set("publishedAt", v)}
            />
          </div>
          <Field
            label="Excerpt"
            value={post.excerpt}
            onChange={(v) => set("excerpt", v)}
            hint="One or two sentences. Shown on the blog index and used as the meta description."
          />
        </Card>

        <Card title="Cover image">
          <CoverImageField value={post.coverImage} onChange={(v) => set("coverImage", v)} />
        </Card>

        <Card title="Body">
          <RichTextEditor
            value={post.body}
            onChange={(html) => set("body", html)}
            placeholder="Start writing. Headings, lists, quotes, code and images are all supported."
          />
        </Card>

        <Card title="Publishing">
          <Field
            label="Tags"
            value={post.tags.join(", ")}
            onChange={(v) => set("tags", v.split(",").map((t) => t.trim()).filter(Boolean))}
            hint="Comma separated."
          />
          <label className="flex items-center gap-2.5 text-[13.5px] text-body">
            <input
              type="checkbox"
              name="draft"
              checked={post.draft}
              onChange={(e) => set("draft", e.target.checked)}
              className="h-4 w-4 accent-[var(--accent-deep)]"
            />
            Keep as draft (hidden from the public blog)
          </label>
        </Card>
      </div>

      <SaveBar
        state={state}
        canSave={canSave}
        extra={
          !post.draft && post.slug ? (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener"
              className="min-h-[44px] inline-flex items-center rounded-pill border border-line bg-surface px-6 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
            >
              View post ↗
            </a>
          ) : undefined
        }
      />
    </form>
  );
}

/** Optional hero image for the index card, the post header and Open Graph. */
function CoverImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange((await uploadBlogImage(file)).url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-5">
      <div className="relative h-[120px] w-[200px] shrink-0 overflow-hidden rounded-xl border border-line bg-bg-tint">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of a just-uploaded image
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-center text-[11.5px] leading-[1.4] text-muted">
            No cover image
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-surface/70 text-[11.5px] font-semibold text-ink">
            Uploading…
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-[12.5px] leading-[1.6] text-body">
          Optional. Shown at the top of the post, on the blog index and as the preview image when
          the link is shared. Landscape works best (about 16:9); it is resized to 1600px and
          converted to WebP.
        </p>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex min-h-[36px] cursor-pointer items-center rounded-pill border border-accent bg-accent px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-accent-deep has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void pick(e.target.files?.[0])}
            />
            {value ? "Replace image" : "Upload image"}
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex min-h-[36px] items-center rounded-pill border border-line bg-surface px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
            >
              Remove
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="text-[12.5px] text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
