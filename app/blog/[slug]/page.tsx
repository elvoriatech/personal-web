import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getPost, listPosts } from "@/lib/blog/store";
import { readingMinutes, renderPostBody } from "@/lib/blog/types";
import { site } from "@/content/site";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await listPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post.draft) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      url: `${site.url}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post.draft) notFound();

  const blocks = renderPostBody(post.body);
  const published = new Date(`${post.publishedAt}T00:00:00Z`).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: site.name, url: site.url },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  return (
    <>
      <Header />
      <main id="main" className="bg-bg pt-[76px]">
        <article className="container-site py-16 lg:py-20">
          <div className="mx-auto max-w-[68ch]">
            <Link
              href="/blog"
              className="inline-flex min-h-[40px] items-center gap-1.5 text-[13px] text-body hover:text-accent-deep"
            >
              ← All posts
            </Link>

            <p className="mt-5 text-[12.5px] text-muted">
              {published} · {readingMinutes(post.body)} min read
            </p>
            <h1 className="mt-2 font-display text-[clamp(28px,3.6vw,38px)] font-bold leading-[1.15] text-ink">
              {post.title}
            </h1>

            <div className="mt-8 space-y-5 text-[15.5px] leading-[1.75] text-body">
              {blocks.map((block, i) => {
                if (block.kind === "heading") {
                  return (
                    <h2
                      key={i}
                      className="pt-3 font-display text-[20px] font-semibold text-ink"
                    >
                      {block.text}
                    </h2>
                  );
                }
                if (block.kind === "list") {
                  return (
                    <ul key={i} className="list-disc space-y-1.5 pl-6">
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i}>{block.text}</p>;
              })}
            </div>

            {post.tags.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-1.5 border-t border-line pt-6">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-pill border border-line bg-surface px-2.5 py-1 text-[11.5px] text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
