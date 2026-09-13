import Link from "next/link";
import type { ReactNode } from "react";
import { PrintButton } from "./PrintButton";

/**
 * Screen-only toolbar plus the printable sheet. The toolbar is hidden when
 * printing, so Cmd/Ctrl-P produces a clean single-column PDF an ATS can parse.
 */
export type Download = { href: string; label: string; hint?: string };

export function DocumentChrome({
  title,
  downloads,
  children,
}: {
  title: string;
  downloads: Download[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-tint py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-6 flex max-w-[820px] flex-wrap items-center justify-between gap-3 px-5 print:hidden">
        <Link
          href="/"
          className="inline-flex min-h-[40px] items-center gap-1.5 text-[13px] text-body hover:text-accent-deep"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path
              d="M13.5 8h-11M6.5 4l-4 4 4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to site
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {downloads.map((d) => (
            <a
              key={d.href}
              href={d.href}
              title={d.hint}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-pill border border-line bg-surface px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink hover:border-accent hover:text-accent-deep"
            >
              {d.label}
            </a>
          ))}
          <PrintButton />
        </div>
      </div>

      <article className="mx-auto max-w-[820px] bg-white px-10 py-12 shadow-[0_20px_60px_-40px_rgba(28,20,60,0.5)] print:max-w-none print:px-0 print:py-0 print:shadow-none">
        <h1 className="sr-only">{title}</h1>
        {children}
      </article>
    </div>
  );
}

export function DocHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-7 border-b border-neutral-300 pb-1 font-display text-[12.5px] font-bold uppercase tracking-[0.1em] text-black first:mt-0">
      {children}
    </h2>
  );
}
