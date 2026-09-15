"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { skillBars, techGroups } from "@/content/skills";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechIcon } from "@/components/ui/TechIcon";

function SkillBar({ label, level }: { label: string; level: number }) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  /* The observer watches the TRACK, not the fill. The fill starts at zero
     width, and IntersectionObserver never reports a zero-area element as
     visible — so driving this with `whileInView` on the fill itself deadlocks
     and every bar stays empty. */
  const inView = useInView(trackRef, { once: true, margin: "-60px" });
  const filled = reduced || inView;

  return (
    <li>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[13.5px] text-body">{label}</span>
        <span className="font-display text-[12px] font-semibold text-ink tabular-nums">
          {level}%
        </span>
      </div>
      <div
        ref={trackRef}
        className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-line"
        role="meter"
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.div
          className="h-full rounded-full accent-gradient"
          initial={false}
          animate={{ width: filled ? `${level}%` : "0%" }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </div>
    </li>
  );
}

export function Expertise() {
  return (
    <section id="stack" className="bg-bg py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading
            eyebrow="Technical stack"
            title="What it is built with"
            action={
              <p className="max-w-[44ch] text-[13.5px] leading-[1.65] text-body">
                For the engineers on your side. Everything above is delivered with this stack, and the
                full list is in the CV.
              </p>
            }
          />
        </Reveal>

        <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <Reveal>
            <ul className="space-y-5">
              {skillBars.map((s) => (
                <SkillBar key={s.label} label={s.label} level={s.level} />
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="space-y-6">
              {techGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-3 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {group.title}
                  </p>
                  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {group.items.map((tech) => (
                      <li key={tech.key}>
                        <div className="card-surface flex aspect-square flex-col items-center justify-center gap-2 p-2 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_36px_-28px_rgba(28,20,60,0.55)]">
                          <TechIcon name={tech.key} size={26} />
                          <span className="text-center text-[9.5px] font-medium leading-tight text-muted">
                            {tech.label}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
