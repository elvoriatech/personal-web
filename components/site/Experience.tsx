import { documents, education, experience } from "@/content/site";
import { skillGroups } from "@/content/skills";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Experience() {
  return (
    <section id="experience" className="bg-bg py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading eyebrow="Career" title="Where I've Built" />
        </Reveal>

        <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
          {/* ---------------- roles ---------------- */}
          <ol className="relative space-y-8 border-l border-line pl-7">
            {experience.map((role, i) => (
              <Reveal key={role.company} delay={i * 0.06}>
                <li className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[34px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-surface bg-accent"
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-[15.5px] font-semibold text-ink">
                      {role.role}
                      <span className="font-normal text-accent-deep"> · {role.company}</span>
                    </h3>
                    <p className="text-[12px] text-muted">
                      {role.period} · {role.location}
                    </p>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {role.points.map((point) => (
                      <li
                        key={point}
                        className="relative pl-4 text-[13.5px] leading-[1.65] text-body before:absolute before:left-0 before:top-[0.62em] before:h-1 before:w-1 before:rounded-full before:bg-accent/60"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </li>
              </Reveal>
            ))}
          </ol>

          {/* ---------------- stack + education ---------------- */}
          <div className="space-y-8">
            <Reveal delay={0.1}>
              <div className="card-surface p-6">
                <h3 className="font-display text-[14px] font-semibold text-ink">
                  Technical Stack
                </h3>
                <dl className="mt-4 space-y-3.5">
                  {skillGroups.map((group) => (
                    <div key={group.title}>
                      <dt className="font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-accent-deep">
                        {group.title}
                      </dt>
                      <dd className="mt-1.5 flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="rounded-pill border border-line bg-bg px-2.5 py-1 text-[11px] text-body"
                          >
                            {item}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="card-surface p-6">
                <h3 className="font-display text-[14px] font-semibold text-ink">
                  Education & Certification
                </h3>
                <ul className="mt-4 space-y-3.5">
                  {education.map((item) => (
                    <li key={item.title}>
                      <p className="font-display text-[13px] font-semibold text-ink">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {item.org} · {item.period}
                      </p>
                      {item.detail && (
                        <p className="mt-1.5 text-[12px] leading-[1.6] text-body">
                          {item.detail}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="card-surface p-6">
                <h3 className="font-display text-[14px] font-semibold text-ink">
                  Documents
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {documents.map((doc) => (
                    <li key={doc.label}>
                      <a
                        href={doc.href}
                        download
                        className="group flex items-center gap-3 rounded-xl border border-line bg-bg px-3.5 py-3 transition-colors hover:border-accent hover:bg-bg-violet"
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-accent-deep"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2.5H7a2 2 0 00-2 2v15a2 2 0 002 2h10a2 2 0 002-2V7.5z" />
                            <path d="M14 2.5v5h5" />
                          </svg>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[13px] font-semibold text-ink">
                            {doc.label}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] text-muted">
                            {doc.note}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-muted transition-colors group-hover:text-accent-deep"
                        >
                          <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                            <path
                              d="M8 2.5v8m0 0L4.8 7.3M8 10.5l3.2-3.2M2.8 13.2h10.4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
