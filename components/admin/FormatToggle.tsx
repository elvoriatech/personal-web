"use client";

import {
  DOCUMENT_FORMATS,
  DOCUMENT_FORMAT_LABELS,
  type DocumentFormat,
} from "@/lib/documents/types";

/** Compact PDF / Word switch for the download controls. */
export function FormatToggle({
  value,
  onChange,
  label = "File format",
}: {
  value: DocumentFormat;
  onChange: (format: DocumentFormat) => void;
  label?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-pill border border-line bg-bg-tint p-0.5"
    >
      {DOCUMENT_FORMATS.map((format) => (
        <button
          key={format}
          type="button"
          aria-pressed={value === format}
          onClick={() => onChange(format)}
          className={`min-h-[30px] rounded-pill px-3 text-[11.5px] font-semibold transition-colors ${
            value === format ? "bg-surface text-ink shadow-sm" : "text-body hover:text-ink"
          }`}
        >
          {DOCUMENT_FORMAT_LABELS[format]}
        </button>
      ))}
    </div>
  );
}
