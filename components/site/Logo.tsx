import { site } from "@/content/site";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="accent-gradient flex h-10 w-10 items-center justify-center rounded-[11px] font-display text-[15px] font-bold tracking-tight text-white"
      >
        {site.initials}
      </span>
      {/*
        Wordmark is hidden below sm (it pushes the menu button off a 375px
        screen) and again between lg and xl — that band is where the desktop
        nav appears but there isn't yet room for nav + wordmark + CTA.
      */}
      {!compact && (
        <span className="hidden flex-col leading-none sm:flex lg:hidden xl:flex">
          <span className="whitespace-nowrap font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-ink">
            {site.name}
          </span>
          <span className="mt-1 whitespace-nowrap font-display text-[9px] uppercase tracking-[0.22em] text-muted">
            AI Engineer
          </span>
        </span>
      )}
    </span>
  );
}
