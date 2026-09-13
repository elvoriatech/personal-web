import Image from "next/image";
import avatar from "@/assets/zahoor-avatar.jpg";
import { pullQuote } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

export function PullQuote() {
  return (
    <section className="bg-bg pb-20 lg:pb-24">
      <div className="container-site">
        <Reveal>
          <figure className="rounded-card border border-line bg-bg-tint p-7 sm:p-9">
            <div className="flex flex-col gap-7 md:flex-row md:items-center md:gap-10">
              <svg
                viewBox="0 0 40 32"
                aria-hidden="true"
                className="h-8 w-10 shrink-0 text-accent/45"
                fill="currentColor"
              >
                <path d="M0 32V17.4C0 7.9 5.2 1.7 15 0l1.7 4.6c-5.6 1.6-8.4 5-8.6 10.1H16V32H0zm24 0V17.4C24 7.9 29.2 1.7 39 0l1.7 4.6c-5.6 1.6-8.4 5-8.6 10.1H40V32H24z" />
              </svg>

              <blockquote className="flex-1">
                <p className="text-[clamp(15px,1.6vw,17px)] leading-[1.75] text-ink">
                  {pullQuote.quote}
                </p>
              </blockquote>

              <figcaption className="flex shrink-0 items-center gap-3 md:w-[210px]">
                <Image
                  src={avatar}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <span className="flex flex-col">
                  <span className="font-display text-[13.5px] font-semibold text-ink">
                    {pullQuote.author}
                  </span>
                  <span className="mt-0.5 text-[11.5px] text-muted">
                    {pullQuote.attribution}
                  </span>
                </span>
              </figcaption>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
