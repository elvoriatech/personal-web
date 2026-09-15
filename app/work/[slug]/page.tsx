import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { caseStudies, projectBySlug, type CaseStudy, type Project } from "@/content/projects";
import { discoveryCall } from "@/content/business";
import { site } from "@/content/site";
import { caseStudyJsonLd } from "@/lib/seo/structuredData";

export function generateStaticParams() {
  return caseStudies.map((p) => ({ slug: p.slug }));
}

function load(slug: string): (Project & { caseStudy: CaseStudy }) | null {
  const project = projectBySlug(slug);
  return project?.caseStudy ? (project as Project & { caseStudy: CaseStudy }) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = load(slug);
  if (!project) return { title: "Case study not found" };

  const title = `${project.name} case study — ${project.category}`;
  const description = `${project.caseStudy.problem} ${project.caseStudy.solution}`.slice(0, 300);
  return {
    title,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${site.url}/work/${project.slug}`,
      ...(project.image ? { images: [{ url: `${site.url}${project.image}` }] } : {}),
    },
  };
}

const statusLabel: Record<Project["status"], string> = {
  live: "Live",
  building: "In development",
  offline: "Archived",
};

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`cs-${label}`} className="grid gap-3 border-t border-line py-8 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-8">
      <h2 id={`cs-${label}`} className="font-display text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
        {label}
      </h2>
      <div className="text-[16px] leading-[1.75] text-body">{children}</div>
    </section>
  );
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = load(slug);
  if (!project) notFound();

  const { caseStudy } = project;
  const others = caseStudies.filter((p) => p.slug !== project.slug);
  const [from, to] = project.tint;

  return (
    <>
      <Header />
      <main id="main" className="bg-bg pt-[76px]">
        <article className="container-site max-w-[900px] py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-[12.5px] text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-accent-deep">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/#work" className="hover:text-accent-deep">Work</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">{project.name}</li>
            </ol>
          </nav>

          <header className="mt-6">
            <p className="eyebrow">{project.category}</p>
            <h1 className="mt-2 font-display text-[clamp(30px,4.6vw,46px)] font-bold leading-[1.1] text-ink">
              {project.name}
            </h1>
            <p className="mt-4 max-w-[64ch] text-[17px] leading-[1.7] text-body">{project.blurb}</p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
              <div>
                <dt className="font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">Role</dt>
                <dd className="mt-0.5 text-ink">{caseStudy.role}</dd>
              </div>
              <div>
                <dt className="font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">Status</dt>
                <dd className="mt-0.5 text-ink">{statusLabel[project.status]}</dd>
              </div>
              {project.href && (
                <div>
                  <dt className="font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">Live site</dt>
                  <dd className="mt-0.5">
                    <a href={project.href} target="_blank" rel="noopener noreferrer" className="text-accent-deep hover:underline">
                      {project.href.replace(/^https?:\/\//, "")}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </header>

          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-card border border-line">
            {project.image ? (
              <Image src={project.image} alt={`Screenshot of ${project.name}`} fill sizes="(max-width: 900px) 100vw, 900px" className="object-cover object-top" loading="eager" />
            ) : (
              <div className="flex h-full w-full items-center justify-center" style={{ backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}>
                <span className="font-display text-[clamp(24px,4vw,40px)] font-semibold tracking-tight text-white/95">{project.name}</span>
              </div>
            )}
          </div>

          <div className="mt-10">
            <Block label="Problem"><p>{caseStudy.problem}</p></Block>
            <Block label="Solution"><p>{caseStudy.solution}</p></Block>
            <Block label="Architecture">
              <ol className="flex flex-wrap items-center gap-2" aria-label="Data flow">
                {caseStudy.architecture.map((step, i) => (
                  <li key={step} className="flex items-center gap-2">
                    <span className="rounded-pill border border-line bg-surface px-3 py-1.5 font-display text-[12.5px] font-semibold text-ink">{step}</span>
                    {i < caseStudy.architecture.length - 1 && <ArrowRight className="text-accent" />}
                  </li>
                ))}
              </ol>
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Built with">
                {project.stack.map((tech) => (
                  <li key={tech} className="rounded-pill bg-bg-violet px-2.5 py-1 text-[11.5px] text-accent-deep">{tech}</li>
                ))}
              </ul>
            </Block>
            <Block label="Result"><p>{caseStudy.outcome}</p></Block>
            <Block label="Why it matters to you"><p>{caseStudy.relevance}</p></Block>
          </div>

          <aside className="mt-6 rounded-card border border-line bg-bg-violet p-7 sm:p-9">
            <p className="eyebrow">{discoveryCall.eyebrow}</p>
            <h2 className="mt-2 font-display text-[22px] font-semibold text-ink">Have a similar problem?</h2>
            <p className="mt-2 max-w-[56ch] text-[14.5px] leading-[1.7] text-body">
              {discoveryCall.meta}. {discoveryCall.promise}
            </p>
            <div className="mt-5">
              <ButtonLink href="/#contact" size="lg">
                {discoveryCall.cta}
                <ArrowRight />
              </ButtonLink>
            </div>
          </aside>

          {others.length > 0 && (
            <nav aria-labelledby="more-cs" className="mt-14">
              <h2 id="more-cs" className="font-display text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">More case studies</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {others.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/work/${p.slug}`} className="card-surface group block h-full p-5 transition-colors hover:border-accent">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{p.category}</p>
                      <p className="mt-1 font-display text-[15px] font-semibold text-ink group-hover:text-accent-deep">{p.name}</p>
                      <p className="mt-2 line-clamp-3 text-[12.5px] leading-[1.6] text-body">{p.caseStudy.problem}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </article>
      </main>
      <Footer />
      <JsonLd data={caseStudyJsonLd(project.slug) ?? []} />
    </>
  );
}
