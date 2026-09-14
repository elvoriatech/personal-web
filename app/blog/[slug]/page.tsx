import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getPost, listPosts } from "@/lib/blog/store";
import { postBodyHtml, postPlainText } from "@/lib/blog/html";
import { readingMinutes } from "@/lib/blog/types";
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
  if (!post || post.draft || post.archivedAt) return { title: "Post not found" };

  const description = post.excerpt || postPlainText(post.body).slice(0, 160);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.publishedAt,
      url: `${site.url}/blog/${post.slug}`,
      ...(post.coverImage ? { images: [{ url: absolute(post.coverImage) }] } : {}),
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
  if (!post || post.draft || post.archivedAt) notFound();

  const html = postBodyHtml(post.body);
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
    ...(post.coverImage ? { image: absolute(post.coverImage) } : {}),
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

            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element -- author-supplied image of unknown size, served from our own cached route
              <img
                src={post.coverImage}
                alt=""
                className="mt-8 aspect-[16/9] w-full rounded-card border border-line object-cover"
              />
            )}

            {/* Sanitised twice — on save and here — so stored HTML can never carry a script. */}
            <div
              className="post-body mt-8 text-[15.5px] leading-[1.75]"
              dangerouslySetInnerHTML={{ __html: html }}
            />

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

/** Absolute URL for Open Graph and JSON-LD, which cannot use a relative path. */
function absolute(url: string): string {
  return url.startsWith("/") ? `${site.url}${url}` : url;
}
