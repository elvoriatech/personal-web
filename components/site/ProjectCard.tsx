import Image from "next/image";
import type { Project } from "@/content/projects";

const statusLabel: Record<Project["status"], string> = {
  live: "Live",
  building: "In development",
  offline: "Archived",
};

function isDark(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 140;
}

function Thumb({ project }: { project: Project }) {
  if (project.image) {
    return (
      <Image
        src={project.image}
        alt={`Screenshot of the ${project.name} ${project.category.toLowerCase()}`}
        width={800}
        height={500}
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }

  /* No public deployment — a designed card, never a mock screenshot. */
  const [from, to] = project.tint;
  const dark = isDark(from);
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2"
      style={{ backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      <span
        className="font-display text-[clamp(17px,2.6vw,23px)] font-semibold tracking-tight"
        style={{ color: dark ? "rgba(255,255,255,0.95)" : "#2A2350" }}
      >
        {project.name}
      </span>
      <span
        className="font-display text-[9.5px] font-medium uppercase tracking-[0.18em]"
        style={{ color: dark ? "rgba(255,255,255,0.6)" : "rgba(42,35,80,0.6)" }}
      >
        {statusLabel[project.status]}
      </span>
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const hasLink = project.href.length > 0;

  return (
    <article className="card-surface group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-34px_rgba(28,20,60,0.55)]">
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line">
        <Thumb project={project} />
        {project.status === "live" && project.image && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-pill bg-white/92 px-2.5 py-1 font-display text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink backdrop-blur-sm">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Live
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[15.5px] font-semibold text-ink">
            {hasLink ? (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="after:absolute after:inset-0 hover:text-accent-deep"
              >
                {project.name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              project.name
            )}
          </h3>
          {hasLink && (
            <span
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-muted transition-colors group-hover:text-accent-deep"
            >
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                <path
                  d="M5.5 10.5l5-5M6.5 5.5h4v4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>

        <p className="mt-1 text-[12px] text-muted">
          {project.context ? `${project.context} · ` : ""}
          {project.category}
        </p>

        <p className="mt-2.5 flex-1 text-[13px] leading-[1.62] text-body">
          {project.blurb}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-pill border border-line bg-bg px-2 py-[3px] text-[10.5px] text-muted"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
