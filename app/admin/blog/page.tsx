import Link from "next/link";
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { canPersist } from "@/lib/documents/store";
import { getPost, listPosts } from "@/lib/blog/store";
import { postBodyHtml } from "@/lib/blog/html";
import { removePost } from "../actions";
import { PostEditor } from "./PostEditor";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  if (!(await isSignedIn())) redirect("/admin/login");

  const { edit } = await searchParams;
  const posts = await listPosts({ includeDrafts: true });
  const found = edit ? await getPost(edit) : null;
  // Older posts are plain text; the editor works in HTML.
  const editing = found ? { ...found, body: postBodyHtml(found.body) } : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[24px] font-semibold text-ink">Blog</h1>
        {edit && (
          <Link
            href="/admin/blog"
            className="inline-flex min-h-[38px] items-center rounded-pill border border-line px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
          >
            New post
          </Link>
        )}
      </div>
      <p className="mt-1.5 text-[13.5px] text-body">
        Write with headings, lists, quotes, code and images — drop or paste pictures straight
        into the text. Leave a post as a draft or publish it; published posts appear at{" "}
        <Link href="/blog" className="text-accent-deep">/blog</Link>.
      </p>

      <div className="mt-7">
        <PostEditor
          key={editing?.slug ?? "new"}
          initial={editing ?? undefined}
          canSave={canPersist()}
        />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-[15px] font-semibold text-ink">
          All posts ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <p className="mt-3 text-[13.5px] text-body">Nothing written yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {posts.map((post) => (
              <li
                key={post.slug}
                className="card-surface flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-[14px] font-semibold text-ink">
                    {post.title}
                    {post.draft && (
                      <span className="ml-2 rounded-pill bg-amber-100 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-amber-800">
                        Draft
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {post.publishedAt} · /blog/{post.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/blog?edit=${encodeURIComponent(post.slug)}`}
                    className="inline-flex min-h-[34px] items-center rounded-pill border border-line px-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
                  >
                    Edit
                  </Link>
                  <form action={removePost}>
                    <input type="hidden" name="slug" value={post.slug} />
                    <button
                      type="submit"
                      className="inline-flex min-h-[34px] items-center rounded-pill border border-red-200 px-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
