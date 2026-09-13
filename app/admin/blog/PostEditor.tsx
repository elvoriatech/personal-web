"use client";

import { useActionState, useState } from "react";
import { savePost, type SaveState } from "../actions";
import { Card, Field, SaveBar, TextArea } from "@/components/admin/Fields";
import { slugify, type BlogPost } from "@/lib/blog/types";

const blank: BlogPost = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  tags: [],
  publishedAt: new Date().toISOString().slice(0, 10),
  draft: true,
};

export function PostEditor({
  initial,
  canSave,
}: {
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

      <Card title={initial ? `Editing "${initial.title}"` : "New post"}>
        <Field
          label="Title"
          value={post.title}
          onChange={(v) => {
            set("title", v);
            // Keep the slug in step until it has been edited by hand.
            if (!slugTouched) set("slug", slugify(v));
          }}
        />
        <input type="hidden" name="title" value={post.title} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Field
              label="Slug"
              value={post.slug}
              onChange={(v) => {
                setSlugTouched(true);
                set("slug", v);
              }}
              hint="The URL: /blog/<slug>"
            />
          </div>
          <div>
            <Field
              label="Publish date"
              type="date"
              value={post.publishedAt}
              onChange={(v) => set("publishedAt", v)}
            />
            <input type="hidden" name="publishedAt" value={post.publishedAt} />
          </div>
        </div>

        <TextArea
          label="Excerpt"
          rows={2}
          value={post.excerpt}
          onChange={(v) => set("excerpt", v)}
          hint="Shown on the blog index and used as the meta description."
        />
        <input type="hidden" name="excerpt" value={post.excerpt} />

        <TextArea
          label="Body"
          rows={16}
          value={post.body}
          onChange={(v) => set("body", v)}
          hint={'Blank line between paragraphs. "## " for a heading, "- " for a list item. No HTML.'}
        />
        <input type="hidden" name="body" value={post.body} />

        <Field
          label="Tags"
          value={post.tags.join(", ")}
          onChange={(v) => set("tags", v.split(",").map((t) => t.trim()).filter(Boolean))}
          hint="Comma separated."
        />
        <input type="hidden" name="tags" value={post.tags.join(", ")} />

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

      <SaveBar state={state} canSave={canSave} />
    </form>
  );
}
