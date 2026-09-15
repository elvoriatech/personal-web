import Image from "next/image";
import portrait from "@/assets/zahoor-portrait.jpg";
import { hero, stats } from "@/content/site";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { Stagger, StaggerItem } from "@/components/ui/Stagger";
import { CountUp } from "@/components/ui/CountUp";
import { RiseIn } from "@/components/ui/RiseIn";
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

/**
 * Leads with the outcome a client buys, not the job title. The title still
 * appears in the eyebrow, so recruiters and search engines see both.
 */
export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-bg-tint pt-[76px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-[680px] w-[58%] rounded-bl-[140px] bg-gradient-to-b from-bg-violet to-transparent"
      />

      <div className="container-site relative grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-8 lg:pb-24 lg:pt-16">
        <Stagger className="max-w-2xl" delay={0.1}>
          <StaggerItem>
            <p className="inline-block max-w-full rounded-pill border border-line bg-surface px-4 py-1.5 font-display text-[11px] font-semibold uppercase leading-[1.6] tracking-[0.14em] text-accent-deep">
              {hero.eyebrow}
            </p>
          </StaggerItem>

          <StaggerItem>
            <h1 className="mt-6 font-display text-[clamp(36px,5.4vw,60px)] font-bold leading-[1.06] tracking-[-0.01em] text-balance text-ink">
              {hero.headline} <span className="text-accent-deep">{hero.headlineAccent}</span>{" "}
              {hero.headlineTail}
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-6 max-w-[54ch] text-[16.5px] leading-[1.7] text-body">{hero.body}</p>
          </StaggerItem>

          <StaggerItem>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="What I build">
              {hero.capabilities.map((c) => (
                <li
                  key={c}
                  className="rounded-pill border border-line bg-surface px-3 py-1.5 font-display text-[11.5px] font-semibold tracking-[0.04em] text-ink"
                >
                  {c}
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-8 font-display text-[15px] font-semibold text-ink">{hero.question}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <ButtonLink href={hero.primaryCta.href} size="lg">
                {hero.primaryCta.label}
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href={hero.secondaryCta.href} variant="outline" size="lg">
                {hero.secondaryCta.label}
              </ButtonLink>
              <a
                href={hero.cvLink.href}
                download
                className="inline-flex min-h-[44px] items-center gap-1.5 px-2 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-body transition-colors hover:text-accent-deep"
              >
                {hero.cvLink.label}
                <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none">
                  <path
                    d="M8 2v8m0 0L4.8 6.8M8 10l3.2-3.2M2.8 12.6h10.4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </StaggerItem>

          <StaggerItem>
            <dl className="mt-10 flex items-center gap-x-5 sm:gap-x-7">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex min-w-0 items-center gap-2.5 ${i > 0 ? "border-l border-line pl-5 sm:pl-7" : ""}`}
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
                      <CountUp value={stat.value} />
                    </dd>
                    <dt className="mt-1 font-display text-[9px] font-medium uppercase leading-tight tracking-[0.11em] text-muted">
                      {stat.label}
                    </dt>
                  </div>
                </div>
              ))}
            </dl>
          </StaggerItem>
        </Stagger>

        <RiseIn className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:justify-self-end" delay={0.25}>
          <div className="relative aspect-square">
            <div aria-hidden="true" className="absolute inset-0 rounded-full border border-accent/20" />
            <div aria-hidden="true" className="absolute inset-[5%] rounded-full border border-dashed border-accent/25" />

            <Image
              src={portrait}
              alt="Zahoor Ahmed, AI engineer and senior software engineer"
              sizes="(max-width: 1023px) 78vw, 460px"
              placeholder="blur"
              loading="eager"
              fetchPriority="high"
              className="absolute inset-[9%] h-auto w-[82%] rounded-full object-cover shadow-[0_34px_80px_-46px_rgba(28,20,60,0.65)]"
            />

            <RagPanel className="absolute -right-4 top-[4%] w-[46%] max-w-[214px]" />
            <ObservabilityPanel className="absolute -left-5 top-[44%] w-[40%] max-w-[186px]" />
            <PipelinePanel className="absolute -bottom-1 right-[2%] w-[35%] max-w-[162px]" />
          </div>
        </RiseIn>
      </div>
    </section>
  );
}
