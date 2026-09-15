import Image from "next/image";
import Link from "next/link";
import type { CaseStudy, Project } from "@/content/projects";
import { ArrowRight } from "@/components/ui/Button";

/**
 * A featured project told as problem → solution → result, linking to the
 * full write-up. The tech list is deliberately last and small.
 */
export function CaseStudyCard({ project }: { project: Project & { caseStudy: CaseStudy } }) {
  const { caseStudy } = project;
  const [from, to] = project.tint;

  return (
    <article className="card-surface group grid overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-34px_rgba(28,20,60,0.55)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="relative min-h-[220px] overflow-hidden border-b border-line lg:border-b-0 lg:border-r">
        {project.image ? (
          <Image
            src={project.image}
            alt={`Screenshot of ${project.name}`}
            fill
            sizes="(max-width: 1023px) 100vw, 40vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full min-h-[220px] w-full items-center justify-center"
            style={{ backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
          >
            <span className="font-display text-[clamp(20px,2.4vw,26px)] font-semibold tracking-tight text-white/95">
              {project.name}
            </span>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-pill bg-white/92 px-2.5 py-1 font-display text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink backdrop-blur-sm">
          {project.status === "live" ? "Live" : project.status === "building" ? "In development" : "Archived"}
        </span>
      </div>

      <div className="flex flex-col p-6 sm:p-7">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted">
          {project.category} · {caseStudy.role}
        </p>
        <h3 className="mt-2 font-display text-[20px] font-semibold leading-snug text-ink">
          <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0 hover:text-accent-deep">
            {project.name}
          </Link>
        </h3>

        <dl className="mt-4 space-y-3">
          <div>
            <dt className="font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-accent-deep">Problem</dt>
            <dd className="mt-1 text-[13.5px] leading-[1.65] text-body">{caseStudy.problem}</dd>
          </div>
          <div>
            <dt className="font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-accent-deep">Solution</dt>
            <dd className="mt-1 text-[13.5px] leading-[1.65] text-body">{caseStudy.solution}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <ul className="flex flex-wrap gap-1.5" aria-label="Built with">
            {project.stack.map((tech) => (
              <li key={tech} className="rounded-pill border border-line bg-bg px-2 py-[3px] text-[10.5px] text-muted">
                {tech}
              </li>
            ))}
          </ul>
          <span className="inline-flex items-center gap-1.5 font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-accent-deep">
            Read the case study
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
