import { faqs } from "@/content/business";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Plain <details> so every answer is in the HTML for search engines and
 * AI crawlers, with no JavaScript needed to read it.
 */
export function Faq() {
  return (
    <section id="faq" className="bg-bg py-20 lg:py-24">
      <div className="container-site grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Questions clients ask before the first call" />
          <p className="mt-4 max-w-[40ch] text-[13.5px] leading-[1.65] text-body">
            Anything missing? Ask it on the discovery call, or send it through the form below.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="divide-y divide-line rounded-card border border-line bg-surface">
            {faqs.map((f) => (
              <details key={f.q} className="group px-6 py-4 open:bg-bg-tint/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 font-display text-[15px] font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-accent-deep transition-transform group-open:rotate-45"
                  >
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M8 3v10M3 8h10" />
                    </svg>
                  </span>
                </summary>
                <p className="pb-2 pt-2 text-[14px] leading-[1.7] text-body">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
