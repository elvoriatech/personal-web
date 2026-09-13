"use client";

import { useEffect, useRef, useState } from "react";
import { EMAIL_THEMES, type EmailTheme } from "@/lib/campaigns/themes";

/**
 * Modal that shows an email exactly as it will be sent, in a sandboxed
 * <iframe>. `load` fetches the HTML for a theme, so callers can preview a
 * saved template (GET) or unsaved editor content (POST) with the same dialog.
 *
 * Built on the native <dialog>: focus is trapped, Esc closes, and the page
 * behind is inert — none of which needs a library.
 *
 * State is derived rather than synchronised: the theme shown is the caller's
 * theme unless the user overrides it inside the dialog, and "loading" is
 * simply "the result we hold is not for the theme we are showing".
 */
export function EmailPreviewDialog({
  open,
  title,
  theme: callerTheme,
  onClose,
  load,
}: {
  open: boolean;
  title: string;
  theme: EmailTheme;
  onClose: () => void;
  load: (theme: EmailTheme) => Promise<string>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [override, setOverride] = useState<EmailTheme | null>(null);
  const [result, setResult] = useState<{ theme: EmailTheme; html: string; error: string } | null>(null);

  const theme = override ?? callerTheme;
  const loading = open && result?.theme !== theme;

  // Mirror the `open` prop onto the native dialog.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Fetch whenever the dialog is open for a (theme, loader) pair. Results land
  // asynchronously; a stale response for a theme we have moved on from is
  // dropped by the cancelled flag.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    load(theme)
      .then((html) => {
        if (!cancelled) setResult({ theme, html, error: "" });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            theme,
            html: "",
            error: err instanceof Error ? err.message : "Could not load the preview.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, theme, load]);

  function close() {
    setOverride(null);
    onClose();
  }

  return (
    <dialog
      ref={ref}
      onClose={close}
      // Chrome's close-watcher rules can swallow the native Escape → cancel
      // path when the dialog was opened without a fresh user activation, so
      // handle the key ourselves rather than trust the built-in behaviour.
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
      }}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself, not its children) closes.
        if (e.target === ref.current) close();
      }}
      className="m-auto w-[min(100vw-24px,760px)] rounded-card border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col" style={{ height: "min(88vh, 900px)" }}>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <p className="font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Preview · exactly as sent
            </p>
            <h2 className="truncate font-display text-[15px] font-semibold text-ink">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label="Theme"
              className="inline-flex rounded-pill border border-line bg-bg-tint p-0.5"
            >
              {EMAIL_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={theme === t.id}
                  onClick={() => setOverride(t.id)}
                  className={`min-h-[30px] rounded-pill px-3 text-[11.5px] font-semibold transition-colors ${
                    theme === t.id ? "bg-surface text-ink shadow-sm" : "text-body hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close preview"
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-pill border border-line text-body hover:border-accent hover:text-accent-deep"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 bg-bg-tint">
          {result?.error && result.theme === theme ? (
            <p className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
              {result.error}
            </p>
          ) : (
            <iframe
              title={`${title} — ${theme} theme`}
              srcDoc={result?.html ?? ""}
              sandbox=""
              tabIndex={-1}
              className={`h-full w-full border-0 transition-opacity ${loading ? "opacity-40" : "opacity-100"}`}
            />
          )}
          {loading && (
            <p
              role="status"
              className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-pill bg-ink/80 px-3 py-1 text-[11.5px] font-semibold text-white"
            >
              Rendering…
            </p>
          )}
        </div>

        <footer className="border-t border-line px-5 py-2.5 text-[11.5px] text-muted">
          Sample recipient: Lena at Nordlicht Logistik GmbH (logistics). Links are disabled in
          the preview.
        </footer>
      </div>
    </dialog>
  );
}
