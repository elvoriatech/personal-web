import Image from "next/image";
import portrait from "@/assets/zahoor-portrait.jpg";
import { hero, stats } from "@/content/site";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import {
  ObservabilityPanel,
  PipelinePanel,
  RagPanel,
} from "./HeroPanels";

const statIcons = [
  <path key="a" d="M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />,
  <path key="b" d="M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4M4 17l8 4 8-4" />,
  <path key="c" d="M12 21s7-5.1 7-10a7 7 0 10-14 0c0 4.9 7 10 7 10z M12 11a2 2 0 100-4 2 2 0 000 4z" />,
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-bg-tint pt-[76px]">
      {/* soft violet wash behind the portrait side */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-[680px] w-[58%] rounded-bl-[140px] bg-gradient-to-b from-bg-violet to-transparent"
      />

      <div className="container-site relative grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:gap-8 lg:pb-24 lg:pt-16">
        {/* ---------------- copy ---------------- */}
        <div className="max-w-xl">
          <p className="inline-flex items-center rounded-pill border border-line bg-surface px-4 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
            {hero.eyebrow}
          </p>

          <h1 className="mt-6 font-display text-[clamp(40px,6.4vw,66px)] font-bold leading-[1.04] text-ink">
            {hero.headline}
          </h1>

          <p className="mt-3 font-display text-[clamp(22px,3.4vw,38px)] font-normal leading-[1.22] text-body">
            {hero.subheadLead}
            <br />
            <span className="text-accent-deep">{hero.subheadAccent}</span>{" "}
            <span className="text-ink">{hero.subheadTail}</span>
          </p>

          <p className="mt-6 max-w-[46ch] text-[16px] leading-[1.7] text-body">
            {hero.body}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href={hero.secondaryCta.href}
              variant="outline"
              size="lg"
              download
            >
              {hero.secondaryCta.label}
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none">
                <path
                  d="M8 2v8m0 0L4.8 6.8M8 10l3.2-3.2M2.8 12.6h10.4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ButtonLink>
          </div>

          {/* ---------------- stats ---------------- */}
          <dl className="mt-10 flex items-center gap-x-5 sm:gap-x-7">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex min-w-0 items-center gap-2.5 ${
                  i > 0 ? "border-l border-line pl-5 sm:pl-7" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-violet text-accent-deep sm:flex"
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
                    {statIcons[i]}
                  </svg>
                </span>
                <div>
                  <dd className="font-display text-[20px] font-bold leading-none text-ink">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 font-display text-[9px] font-medium uppercase leading-tight tracking-[0.11em] text-muted">
                    {stat.label}
                  </dt>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------------- portrait ---------------- */}
        <div className="relative mx-auto w-full max-w-[560px] lg:mx-0">
          <div className="relative aspect-square">
            {/* concentric decorative rings, hugging the portrait */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-accent/20"
            />
            <div
              aria-hidden="true"
              className="absolute inset-[5%] rounded-full border border-dashed border-accent/25"
            />

            <Image
              src={portrait}
              alt="Zahoor Ahmed, Senior Software Engineer and AI Engineer"
              sizes="(max-width: 1023px) 78vw, 480px"
              placeholder="blur"
              loading="eager"
              fetchPriority="high"
              className="absolute inset-[9%] h-auto w-[82%] rounded-full object-cover shadow-[0_34px_80px_-46px_rgba(28,20,60,0.65)]"
            />

            <RagPanel className="absolute -right-4 top-[4%] w-[46%] max-w-[214px]" />
            <ObservabilityPanel className="absolute -left-5 top-[44%] w-[40%] max-w-[186px]" />
            <PipelinePanel className="absolute -bottom-1 right-[2%] w-[35%] max-w-[162px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
