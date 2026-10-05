"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { BlogPost } from "@/lib/blog/types";
import { archivePost, removePost } from "../actions";

/** One archived post: Restore, or a permanent delete behind a confirmation popup. */
export function ArchivedPostRow({ post }: { post: BlogPost }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function remove() {
    setError("");
    startTransition(async () => {
      try {
        const data = new FormData();
        data.set("slug", post.slug);
        await removePost(data);
        setConfirming(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete the post.");
      }
    });
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-display text-[13px] font-semibold text-ink">{post.title}</p>
        <p className="truncate text-[11.5px] text-muted">
          /blog/{post.slug} · archived {post.archivedAt}
        </p>
      </div>

      <div className="flex gap-2">
        <form action={archivePost}>
          <input type="hidden" name="slug" value={post.slug} />
          <input type="hidden" name="restore" value="1" />
          <button
            type="submit"
            className="inline-flex min-h-[34px] items-center rounded-pill border border-line px-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
          >
            Restore
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex min-h-[34px] items-center rounded-pill border border-red-200 px-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-red-700 hover:bg-red-50"
        >
          Delete permanently
        </button>
      </div>

      <ConfirmDialog
        open={confirming}
        title={`Delete “${post.title}”?`}
        busy={pending}
        error={error}
        onCancel={() => {
          setConfirming(false);
          setError("");
        }}
        onConfirm={remove}
      >
        The post and its address /blog/{post.slug} are removed permanently. This cannot be undone.
      </ConfirmDialog>
    </li>
  );
}
