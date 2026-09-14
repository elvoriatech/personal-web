"use client";

import { useState } from "react";
import type { BlogPost } from "@/lib/blog/types";
import { archivePost, removePost } from "../actions";

/** One archived post: Restore, or a two-step permanent delete. */
export function ArchivedPostRow({ post }: { post: BlogPost }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-display text-[13px] font-semibold text-ink">{post.title}</p>
        <p className="truncate text-[11.5px] text-muted">
          /blog/{post.slug} · archived {post.archivedAt}
        </p>
      </div>

      {confirming ? (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-red-800">
          Delete “{post.title}” permanently? This cannot be undone.
          <form action={removePost}>
            <input type="hidden" name="slug" value={post.slug} />
            <button
              type="submit"
              className="min-h-[32px] rounded-pill bg-red-600 px-3.5 text-[11.5px] font-semibold text-white"
            >
              Delete
            </button>
          </form>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="min-h-[32px] rounded-pill border border-line bg-surface px-3.5 text-[11.5px] font-semibold text-body"
          >
            Keep
          </button>
        </div>
      ) : (
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
      )}
    </li>
  );
}
