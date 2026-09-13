import { projects } from "@/content/projects";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "./ProjectCard";

/**
 * Every project, always visible. This used to show three and reveal the rest
 * behind a toggle; with the full list rendered there is no client state left,
 * so the section is a server component again.
 */
export function SelectedWork() {
  return (
    <section id="projects" className="bg-surface py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading eyebrow="Portfolio" title="Projects" />
        </Reveal>

        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal
              key={project.name}
              // Stagger within each row of three, not across the whole grid,
              // so the last cards do not lag behind the scroll.
              delay={(i % 3) * 0.06}
              className="relative"
            >
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
