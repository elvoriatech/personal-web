import { services, type Service } from "@/content/services";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const icons: Record<Service["icon"], React.ReactNode> = {
  web: (
    <>
      <rect x="2.5" y="4" width="19" height="15" rx="2.5" />
      <path d="M2.5 8.5h19M6 6.2h.01M8.4 6.2h.01" />
    </>
  ),
  mobile: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.6 18.6h2.8" />
    </>
  ),
  desktop: (
    <>
      <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
      <path d="M8 20.5h8M12 16.5v4" />
    </>
  ),
  ai: (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.4" />
    </>
  ),
};

export function Services() {
  return (
    <section id="services" className="bg-bg py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading eyebrow="Services" title="What I Do" />
        </Reveal>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 0.06}>
              <article className="card-surface group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-34px_rgba(28,20,60,0.5)]">
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
                    {icons[service.icon]}
                  </svg>
                </span>

                <h3 className="mt-5 font-display text-[15px] font-semibold text-ink">
                  {service.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-body">
                  {service.blurb}
                </p>

                <span
                  aria-hidden="true"
                  className="mt-5 block h-[2.5px] w-9 rounded-full bg-accent transition-all duration-300 group-hover:w-16"
                />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
