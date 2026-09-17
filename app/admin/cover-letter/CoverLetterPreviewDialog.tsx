"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadCurrentButton } from "@/components/admin/DownloadCurrentButton";
import { FormatToggle } from "@/components/admin/FormatToggle";
import {
  DEFAULT_DOCUMENT_FORMAT,
  DOCUMENT_FORMAT_LABELS,
  type DocumentFormat,
} from "@/lib/documents/types";
import { CoverLetterSheet, coverLetterValues } from "@/components/documents/CoverLetterSheet";
import type { CoverLetterDoc } from "@/lib/documents/types";

/**
 * The letter exactly as the editor holds it — company and role filled in —
 * with a download that builds the file from that same state, in either format.
 */
export function CoverLetterPreviewDialog({
  open,
  letter,
  dirty,
  onClose,
}: {
  open: boolean;
  letter: CoverLetterDoc;
  dirty: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [format, setFormat] = useState<DocumentFormat>(DEFAULT_DOCUMENT_FORMAT);
  const values = coverLetterValues(letter);
  const targeted = Boolean(letter.targetCompany.trim() || letter.targetRole.trim());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(100vw-24px,900px)] rounded-card border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col" style={{ height: "min(90vh, 1000px)" }}>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <p className="font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Cover letter preview{dirty ? " · includes unsaved edits" : ""}
            </p>
            <h2 className="truncate font-display text-[15px] font-semibold text-ink">
              {targeted ? `${values.role} · ${values.company}` : "No company or role set — generic wording"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FormatToggle value={format} onChange={setFormat} label="Download format" />
            <DownloadCurrentButton doc="cover-letter" payload={letter} format={format}>
              Download {DOCUMENT_FORMAT_LABELS[format]}
            </DownloadCurrentButton>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-pill border border-line text-body hover:border-accent hover:text-accent-deep"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-bg-tint p-4 sm:p-6">
          <div className="mx-auto min-h-[1123px] w-[794px] bg-white px-14 py-14 shadow-[0_20px_60px_-40px_rgba(28,20,60,0.5)]">
            <CoverLetterSheet letter={letter} />
          </div>
        </div>

        <footer className="border-t border-line px-5 py-2.5 text-[11.5px] text-muted">
          The download is built from exactly what you see, so you can tailor a letter for one
          application without saving it. Save only if you want these values kept as the default.
        </footer>
      </div>
    </dialog>
  );
}
