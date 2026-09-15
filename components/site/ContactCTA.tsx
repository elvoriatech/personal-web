import { site } from "@/content/site";
import { discoveryCall } from "@/content/business";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "./ContactForm";

const details = [
  {
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    icon: <path d="M3 6.5h18v11H3zM3 7l9 6 9-6" />,
  },
  {
    label: "Phone",
    value: site.phone,
    href: `tel:${site.phoneHref}`,
    icon: (
      <path d="M5 3.5h3.2l1.4 4-2 1.4a12 12 0 006.5 6.5l1.4-2 4 1.4V18a2.5 2.5 0 01-2.7 2.5A16.5 16.5 0 013.5 6.2 2.5 2.5 0 015 3.5z" />
    ),
  },
  {
    label: "Location",
    value: site.location,
    href: null,
    icon: (
      <>
        <path d="M12 21s7-5.1 7-10a7 7 0 10-14 0c0 4.9 7 10 7 10z" />
        <circle cx="12" cy="11" r="2.4" />
      </>
    ),
  },
];

export function ContactCTA() {
  return (
    <section id="contact" className="bg-surface py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <div className="relative overflow-hidden rounded-[22px] border border-line bg-bg-violet px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
            {/* paper-plane motif from the template */}
            <svg
              aria-hidden="true"
              viewBox="0 0 120 120"
              className="pointer-events-none absolute -bottom-8 -right-6 hidden h-56 w-56 rotate-6 text-accent/30 lg:block"
              fill="currentColor"
            >
              <path d="M112 8L8 52l38 14 8 38 20-30 30 22z" opacity="0.55" />
              <path d="M46 66l66-58-46 68-6-4z" opacity="0.85" />
            </svg>

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
              <div>
                <p className="eyebrow">{discoveryCall.eyebrow}</p>
                <h2 className="mt-2 font-display text-[clamp(26px,3.4vw,36px)] font-semibold leading-tight">
                  {discoveryCall.title}
                </h2>
                <p className="mt-2 font-display text-[13px] font-semibold uppercase tracking-[0.1em] text-accent-deep">
                  {discoveryCall.meta}
                </p>
                <p className="mt-4 text-[14.5px] text-body">{discoveryCall.intro}</p>
                <ul className="mt-2 space-y-1.5">
                  {discoveryCall.topics.map((t) => (
                    <li
                      key={t}
                      className="relative pl-4 text-[14px] leading-[1.6] text-body before:absolute before:left-0 before:top-[0.62em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent/70"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 max-w-[40ch] text-[14px] leading-[1.7] text-body">{discoveryCall.promise}</p>

                <ul className="mt-7 space-y-4">
                  {details.map((item) => (
                    <li key={item.label} className="flex items-center gap-3.5">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-accent-deep"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="17"
                          height="17"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {item.icon}
                        </svg>
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                          {item.label}
                        </span>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="block truncate py-0.5 text-[14px] text-ink hover:text-accent-deep"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <span className="block text-[14px] text-ink">{item.value}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[18px] border border-line bg-surface p-5 sm:p-7">
                <ContactForm />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
