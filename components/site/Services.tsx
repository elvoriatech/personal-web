import Link from "next/link";
import { services, type Service } from "@/content/services";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRight } from "@/components/ui/Button";

export const serviceIcons: Record<Service["icon"], React.ReactNode> = {
  agents: (
    <>
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M12 3v4M9 12h.01M15 12h.01M9 16h6" />
    </>
  ),
  rag: (
    <>
      <path d="M5 4.5h9l4 4v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 014 19.5v-13A1.5 1.5 0 015.5 5z" />
      <path d="M14 4.5v4h4M8 12h8M8 15.5h5" />
    </>
  ),
  product: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M7 6.5h.01M9.5 6.5h.01M8 13.5l2 2 4-4" />
    </>
  ),
  integration: (
    <>
      <path d="M9 6H6.5A2.5 2.5 0 004 8.5v7A2.5 2.5 0 006.5 18H9M15 6h2.5A2.5 2.5 0 0120 8.5v7a2.5 2.5 0 01-2.5 2.5H15" />
      <path d="M8 12h8M13 9l3 3-3 3" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18a4 4 0 01-.6-7.95A5.5 5.5 0 0117.2 9.2 3.5 3.5 0 0117 18z" />
      <path d="M12 12v6M9.5 15.5L12 18l2.5-2.5" />
    </>
  ),
};

export function Services() {
  return (
    <section id="services" className="bg-bg py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            eyebrow="Services"
            title="Problems I solve"
            action={
              <p className="max-w-[44ch] text-[13.5px] leading-[1.65] text-body">
                Clients don&apos;t buy technologies. They buy automated processes, working
                products and less manual work. Here is what that looks like.
              </p>
            }
          />
        </Reveal>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={(i % 3) * 0.06}>
              <article
                id={service.id}
                className="card-surface group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-34px_rgba(28,20,60,0.5)]"
              >
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg-violet text-accent-deep"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {serviceIcons[service.icon]}
                  </svg>
                </span>

                <h3 className="mt-5 font-display text-[16px] font-semibold leading-snug text-ink">
                  {service.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-body">{service.blurb}</p>

                <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                  {service.deliverables.map((d) => (
                    <li
                      key={d}
                      className="relative pl-4 text-[12.5px] leading-[1.6] text-body before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent/70"
                    >
                      {d}
                    </li>
                  ))}
                </ul>

                <span
                  aria-hidden="true"
                  className="mt-auto block pt-5 after:block after:h-[2.5px] after:w-9 after:rounded-full after:bg-accent after:transition-all after:duration-300 group-hover:after:w-16"
                />
              </article>
            </Reveal>
          ))}

          <Reveal delay={0.12}>
            <Link
              href="/#contact"
              className="group flex h-full flex-col justify-between rounded-card border border-dashed border-accent/40 bg-bg-violet p-6 transition-colors hover:border-accent"
            >
              <div>
                <p className="eyebrow">Something else?</p>
                <h3 className="mt-2 font-display text-[16px] font-semibold leading-snug text-ink">
                  Not sure which of these you need?
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-body">
                  Describe the workflow or the idea in a few lines. On a free 30-minute call I will
                  tell you what I would build first, and whether AI is the right tool at all.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-accent-deep">
                Book a discovery call
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
