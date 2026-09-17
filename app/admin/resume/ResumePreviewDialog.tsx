"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadCurrentButton } from "@/components/admin/DownloadCurrentButton";
import { ResumeSheet } from "@/components/documents/ResumeSheet";
import { FormatToggle } from "@/components/admin/FormatToggle";
import {
  DEFAULT_DOCUMENT_FORMAT,
  DOCUMENT_FORMAT_LABELS,
  RESUME_VARIANTS,
  RESUME_VARIANT_LABELS as LABEL,
  type DocumentFormat,
  type ResumeDoc,
  type ResumeVariant,
} from "@/lib/documents/types";

/**
 * Shows the résumé as it currently is in the editor — unsaved edits included —
 * in either template, and downloads a .docx built from that same state.
 */
export function ResumePreviewDialog({
  open,
  resume,
  variant: callerVariant,
  dirty,
  onClose,
}: {
  open: boolean;
  resume: ResumeDoc;
  variant: ResumeVariant;
  /** Whether the editor holds edits that have not been saved yet. */
  dirty: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [override, setOverride] = useState<ResumeVariant | null>(null);
  const [format, setFormat] = useState<DocumentFormat>(DEFAULT_DOCUMENT_FORMAT);
  const variant = override ?? callerVariant;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  function close() {
    setOverride(null);
    onClose();
  }

  // "" = no photo; undefined = the portrait bundled with the site.
  const photoSrc =
    resume.photoDataUrl === "" ? null : (resume.photoDataUrl ?? "/api/documents/photo");

  return (
    <dialog
      ref={ref}
      onClose={close}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
      }}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
      className="m-auto w-[min(100vw-24px,900px)] rounded-card border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col" style={{ height: "min(90vh, 1000px)" }}>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <p className="font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Résumé preview{dirty ? " · includes unsaved edits" : ""}
            </p>
            <h2 className="font-display text-[15px] font-semibold text-ink">{LABEL[variant]}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Template" className="inline-flex rounded-pill border border-line bg-bg-tint p-0.5">
              {RESUME_VARIANTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={variant === v}
                  onClick={() => setOverride(v)}
                  className={`min-h-[30px] rounded-pill px-3 text-[11.5px] font-semibold transition-colors ${
                    variant === v ? "bg-surface text-ink shadow-sm" : "text-body hover:text-ink"
                  }`}
                >
                  {LABEL[v]}
                </button>
              ))}
            </div>
            <FormatToggle value={format} onChange={setFormat} label="Download format" />
            <DownloadCurrentButton doc="resume" payload={resume} variant={variant} format={format}>
              Download {DOCUMENT_FORMAT_LABELS[format]}
            </DownloadCurrentButton>
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

        {/* A4 proportions at screen size; scrolls in both axes on small windows
            rather than reflowing, so the preview stays true to the page. */}
        <div className="min-h-0 flex-1 overflow-auto bg-bg-tint p-4 sm:p-6">
          <div
            className={`mx-auto w-[794px] min-h-[1123px] bg-white shadow-[0_20px_60px_-40px_rgba(28,20,60,0.5)] ${
              variant === "design" ? "" : variant === "compact" ? "px-10 py-10" : "px-12 py-12"
            }`}
          >
            <ResumeSheet resume={resume} variant={variant} photoSrc={photoSrc} />
          </div>
        </div>

        <footer className="border-t border-line px-5 py-2.5 text-[11.5px] text-muted">
          The preview and the download both use what is in the editor right now
          {dirty ? " (including unsaved edits)" : ""}. Line breaks shift a little between formats:
          the PDF is set in Helvetica, Word in Calibri.
        </footer>
      </div>
    </dialog>
  );
}
