import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { listPosts } from "@/lib/blog/store";
import { readingMinutes } from "@/lib/blog/types";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on software engineering, applied AI and building production systems — by Zahoor Ahmed.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 300;

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function BlogIndex() {
  const posts = await listPosts();

  return (
    <>
      <Header />
      <main id="main" className="bg-bg pt-[76px]">
        <div className="container-site py-16 lg:py-20">
          <p className="eyebrow">Writing</p>
          <h1 className="mt-2 font-display text-[clamp(30px,4vw,42px)] font-bold leading-tight text-ink">
            Notes from the build
          </h1>
          <p className="mt-3 max-w-[56ch] text-[15px] leading-[1.7] text-body">
            Short posts on software engineering, applied AI and what actually
            holds up in production.
          </p>

          {posts.length === 0 ? (
            <p className="mt-12 rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center text-[14px] text-body">
              No posts published yet.
            </p>
          ) : (
            <ul className="mt-10 space-y-4">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="card-surface flex flex-col gap-5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 sm:flex-row"
                  >
                    {post.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element -- author-supplied image from our cached route
                      <img
                        src={post.coverImage}
                        alt=""
                        loading="lazy"
                        className="aspect-[16/10] w-full shrink-0 rounded-xl border border-line object-cover sm:w-[220px]"
                      />
                    )}
                    <div className="min-w-0">
                    <p className="text-[12px] text-muted">
                      {formatDate(post.publishedAt)} · {readingMinutes(post.body)} min read
                    </p>
                    <h2 className="mt-1.5 font-display text-[19px] font-semibold text-ink">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 max-w-[70ch] text-[14px] leading-[1.65] text-body">
                        {post.excerpt}
                      </p>
                    )}
                    {post.tags.length > 0 && (
                      <ul className="mt-3.5 flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-pill border border-line bg-bg px-2.5 py-1 text-[11px] text-muted"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
