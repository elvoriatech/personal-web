import { caseStudies, projects } from "@/content/projects";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CaseStudyCard } from "./CaseStudyCard";
import { ProjectCard } from "./ProjectCard";

/**
 * Case studies first — the evidence a client is looking for — then the rest
 * of the portfolio as compact cards.
 */
export function SelectedWork() {
  const rest = projects.filter((p) => !p.caseStudy);

  return (
    <section id="work" className="bg-surface py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            eyebrow="Case studies"
            title="Proof, not promises"
            action={
              <p className="max-w-[44ch] text-[13.5px] leading-[1.65] text-body">
                Products I own and platforms I built for employers, each told as the problem, what I
                built and what it changed.
              </p>
            }
          />
        </Reveal>

        <div className="mt-9 grid gap-6">
          {caseStudies.map((project, i) => (
            <Reveal key={project.slug} delay={Math.min(i, 2) * 0.05} className="relative">
              <CaseStudyCard project={project} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <h3 className="font-display text-[15px] font-semibold uppercase tracking-[0.1em] text-muted">
            More work
          </h3>
        </Reveal>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((project, i) => (
            <Reveal key={project.slug} delay={(i % 3) * 0.06} className="relative">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
