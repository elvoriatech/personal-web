"use client";

import { useId } from "react";
import { EMAIL_THEMES, type EmailTheme } from "@/lib/campaigns/themes";

/**
 * Radio-card picker for the email theme. The real <input type="radio"> is
 * visually hidden but still focusable, so arrow keys move between themes and
 * the focused card shows a ring.
 */
export function ThemePicker({
  value,
  onChange,
  label = "Email theme",
}: {
  value: EmailTheme;
  onChange: (theme: EmailTheme) => void;
  label?: string;
}) {
  const name = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
        {label}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {EMAIL_THEMES.map((t) => {
          const active = t.id === value;
          return (
            <label
              key={t.id}
              className={`relative flex cursor-pointer gap-3.5 rounded-xl border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 ${
                active
                  ? "border-accent bg-bg-violet"
                  : "border-line bg-surface hover:border-accent/50"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={t.id}
                checked={active}
                onChange={() => onChange(t.id)}
                className="sr-only"
              />
              <ThemeSwatch theme={t.id} active={active} />
              <span className="min-w-0">
                <span className="block font-display text-[13px] font-semibold text-ink">
                  {t.label}
                </span>
                <span className="mt-0.5 block text-[12px] leading-[1.5] text-body">
                  {t.description}
                </span>
                <span className="mt-1 block text-[11.5px] leading-[1.5] text-muted">
                  {t.bestFor}
                </span>
              </span>
              {active && (
                <span className="absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                  <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                    <path
                      d="M2.5 6.2 5 8.6l4.6-5.2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** A thumbnail of the layout, drawn with boxes so it needs no image request. */
function ThemeSwatch({ theme, active }: { theme: EmailTheme; active: boolean }) {
  const line = active ? "bg-accent/25" : "bg-line";
  return (
    <span
      aria-hidden="true"
      className={`flex h-[58px] w-[64px] shrink-0 flex-col overflow-hidden rounded-md border ${
        active ? "border-accent/40" : "border-line"
      } ${theme === "branded" ? "bg-bg-tint" : "bg-surface"}`}
    >
      {theme === "branded" ? (
        <>
          <span className="accent-gradient h-[12px] w-full" />
          <span className="mx-2 mt-2 flex flex-col gap-[3px]">
            <span className={`h-[3px] w-full rounded ${line}`} />
            <span className={`h-[3px] w-[80%] rounded ${line}`} />
            <span className={`h-[3px] w-[90%] rounded ${line}`} />
          </span>
          <span className="mx-2 mt-auto mb-2 h-[5px] w-[22px] rounded-full bg-accent/70" />
        </>
      ) : (
        <>
          <span className="mx-2 mt-2.5 flex flex-col gap-[3px]">
            <span className={`h-[3px] w-full rounded ${line}`} />
            <span className={`h-[3px] w-[85%] rounded ${line}`} />
            <span className={`h-[3px] w-[92%] rounded ${line}`} />
            <span className={`h-[3px] w-[60%] rounded ${line}`} />
          </span>
          <span className="mx-2 mt-auto mb-2 flex gap-1.5">
            <span className="h-[8px] w-[2px] rounded bg-accent" />
            <span className="flex flex-col gap-[2px]">
              <span className={`h-[2.5px] w-[20px] rounded ${line}`} />
              <span className={`h-[2.5px] w-[28px] rounded ${line}`} />
            </span>
          </span>
        </>
      )}
    </span>
  );
}
