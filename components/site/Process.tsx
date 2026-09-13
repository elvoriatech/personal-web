import { processSteps } from "@/content/process";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Process() {
  return (
    <section id="process" className="bg-surface py-20 lg:py-24">
      <div className="container-site">
        <Reveal>
          <SectionHeading eyebrow="My Process" title="A Simple, Effective Process" />
        </Reveal>

        <ol className="relative mt-12 grid gap-9 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {/* connecting rail, desktop only */}
          <span
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-6 hidden h-px bg-gradient-to-r from-transparent via-line to-transparent lg:block"
          />

          {processSteps.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.07}>
              <li className="relative flex flex-col items-center text-center">
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bg-violet font-display text-[14px] font-bold text-accent-deep">
                  {step.step}
                </span>
                <h3 className="mt-4 font-display text-[14.5px] font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 max-w-[24ch] text-[12.5px] leading-[1.6] text-body">
                  {step.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
