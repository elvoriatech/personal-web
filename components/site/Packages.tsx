import { packages, pricingNote } from "@/content/business";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Packages() {
  return (
    <section id="pricing" className="bg-surface py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title="Start small, scale when it works"
            action={<p className="max-w-[44ch] text-[13.5px] leading-[1.65] text-body">{pricingNote}</p>}
          />
        </Reveal>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.05}>
              <article
                className={`flex h-full flex-col rounded-card border p-6 ${
                  p.highlighted
                    ? "border-accent bg-bg-violet shadow-[0_24px_50px_-34px_rgba(28,20,60,0.45)]"
                    : "card-surface"
                }`}
              >
                {p.highlighted && <p className="eyebrow mb-2">Most chosen first</p>}
                <h3 className="font-display text-[16px] font-semibold text-ink">{p.name}</h3>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-[26px] font-bold leading-none text-ink">{p.price}</span>
                  {p.priceNote && <span className="text-[12px] text-muted">{p.priceNote}</span>}
                </p>
                <p className="mt-3 text-[13.5px] leading-[1.65] text-body">{p.summary}</p>
                <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                  {p.includes.map((line) => (
                    <li
                      key={line}
                      className="relative pl-4 text-[12.5px] leading-[1.6] text-body before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent/70"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[12px] text-muted">Timeline: {p.timeline}</p>
                <div className="mt-auto pt-5">
                  <ButtonLink
                    href="/#contact"
                    variant={p.highlighted ? "primary" : "outline"}
                    className="w-full"
                  >
                    Discuss this
                    <ArrowRight />
                  </ButtonLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
