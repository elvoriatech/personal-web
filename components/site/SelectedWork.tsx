"use client";

import { useState } from "react";
import { projects } from "@/content/projects";
import { ArrowRight } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "./ProjectCard";

export function SelectedWork() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section id="projects" className="bg-surface py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            eyebrow="Featured Projects"
            title="Selected Work"
            action={
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
                className="-mr-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-pill px-2 font-display text-[12px] font-semibold uppercase tracking-[0.12em] text-accent-deep transition-colors hover:text-ink"
              >
                {showAll ? "Show less" : "View all projects"}
                <ArrowRight
                  className={`transition-transform duration-300 ${
                    showAll ? "-rotate-90" : ""
                  }`}
                />
              </button>
            }
          />
        </Reveal>

        {/* Every project is rendered into the HTML and the collapsed ones are
            hidden with CSS, so crawlers (and no-JS visitors after hydration)
            still see the full body of work. */}
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal
              key={project.name}
              delay={(project.featured ? i : i - 3) * 0.06}
              className="relative"
              hidden={!project.featured && !showAll}
            >
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
