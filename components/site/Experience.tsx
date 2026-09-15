import { careerSummary, education, experience, featuredRoleCount, hero, site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * A short career section for clients: the three most recent roles with one
 * line each, and the CV for anyone who wants the full history.
 */
export function Experience() {
  const roles = experience.slice(0, featuredRoleCount);

  return (
    <section id="about" className="bg-surface py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            eyebrow="About"
            title="Eight years of production software"
            action={<p className="max-w-[46ch] text-[13.5px] leading-[1.65] text-body">{careerSummary}</p>}
          />
        </Reveal>

        <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <ol className="relative space-y-6 border-l border-line pl-7">
              {roles.map((role, i) => (
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
                    <p className="mt-2 text-[13.5px] leading-[1.65] text-body">{role.points[0]}</p>
                  </li>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={0.2}>
              <div className="mt-7 flex flex-wrap items-center gap-3 pl-7">
                <a
                  href={hero.cvLink.href}
                  download
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-pill border border-line bg-surface px-5 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-ink transition-colors hover:border-accent hover:text-accent-deep"
                >
                  Full CV (.docx)
                  <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none">
                    <path d="M8 2v8m0 0L4.8 6.8M8 10l3.2-3.2M2.8 12.6h10.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <p className="text-[12.5px] text-muted">
                  {experience.length} roles in total · {site.location} · English and German
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="card-surface p-6">
              <h3 className="font-display text-[14px] font-semibold text-ink">Education & certification</h3>
              <ul className="mt-4 space-y-3.5">
                {education.map((item) => (
                  <li key={item.title}>
                    <p className="font-display text-[13px] font-semibold text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {item.org} · {item.period}
                    </p>
                    {item.detail && <p className="mt-1.5 text-[12px] leading-[1.6] text-body">{item.detail}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
