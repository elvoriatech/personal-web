import Image from "next/image";
import avatar from "@/assets/zahoor-avatar.jpg";
import { pullQuote } from "@/content/site";
import { reasons } from "@/content/business";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const icons = [
  <path key="0" d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.3l-4.8 2.6.9-5.4L4.2 8.7l5.4-.8z" />,
  <path key="1" d="M4 19h16M6 19V9l6-4 6 4v10M10 19v-5h4v5" />,
  <path key="2" d="M7 18a4 4 0 01-.6-7.95A5.5 5.5 0 0117.2 9.2 3.5 3.5 0 0117 18zM12 12v6" />,
  <path key="3" d="M5 12l4 4L19 6" />,
];

export function WhyMe() {
  return (
    <section id="why" className="bg-bg py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading eyebrow="Why work with me" title="AI plus the engineering that ships it" />
        </Reveal>

        <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <ul className="grid gap-5 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <Reveal key={r.title} delay={(i % 2) * 0.06}>
                <li className="card-surface h-full p-6">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-violet text-accent-deep"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {icons[i]}
                    </svg>
                  </span>
                  <h3 className="mt-4 font-display text-[15px] font-semibold leading-snug text-ink">{r.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-[1.65] text-body">{r.body}</p>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.1}>
            <figure className="flex h-full flex-col justify-center rounded-card border border-line bg-bg-tint p-7 sm:p-9">
              <svg viewBox="0 0 40 32" aria-hidden="true" className="h-8 w-10 text-accent/45" fill="currentColor">
                <path d="M0 32V17.4C0 7.9 5.2 1.7 15 0l1.7 4.6c-5.6 1.6-8.4 5-8.6 10.1H16V32H0zm24 0V17.4C24 7.9 29.2 1.7 39 0l1.7 4.6c-5.6 1.6-8.4 5-8.6 10.1H40V32H24z" />
              </svg>
              <blockquote className="mt-5">
                <p className="text-[clamp(16px,1.7vw,19px)] leading-[1.7] text-ink">{pullQuote.quote}</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Image src={avatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                <span className="flex flex-col">
                  <span className="font-display text-[13.5px] font-semibold text-ink">{pullQuote.author}</span>
                  <span className="mt-0.5 text-[11.5px] text-muted">{pullQuote.attribution}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
