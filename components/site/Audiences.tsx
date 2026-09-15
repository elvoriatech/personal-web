import { audiences } from "@/content/business";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Audiences() {
  return (
    <section id="who" className="bg-bg py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading eyebrow="Who I help" title="Built for teams without an AI department" />
        </Reveal>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.05}>
              <article className="card-surface h-full p-6">
                <h3 className="font-display text-[15px] font-semibold text-ink">{a.title}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-body">{a.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
