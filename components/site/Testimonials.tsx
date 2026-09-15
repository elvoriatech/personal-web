import { testimonials } from "@/content/business";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Renders nothing until real testimonials are added in content/business.ts. */
export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="bg-surface py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading eyebrow="Testimonials" title="What people I have worked with say" />
        </Reveal>
        <ul className="mt-9 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <li className="card-surface flex h-full flex-col p-6">
                <blockquote className="flex-1 text-[14.5px] leading-[1.7] text-ink">“{t.quote}”</blockquote>
                <p className="mt-5 font-display text-[13px] font-semibold text-ink">{t.name}</p>
                <p className="text-[12px] text-muted">
                  {t.role}, {t.company}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
