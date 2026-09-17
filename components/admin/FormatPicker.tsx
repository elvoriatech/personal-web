"use client";

import { useId } from "react";
import {
  DOCUMENT_FORMATS,
  DOCUMENT_FORMAT_HINTS,
  DOCUMENT_FORMAT_LABELS,
  type DocumentFormat,
} from "@/lib/documents/types";

/**
 * Chooses the file format for the résumé and cover letter. PDF is the default
 * because it renders identically for every recipient; Word stays one click
 * away for the people who ask to edit it.
 */
export function FormatPicker({
  value,
  onChange,
  label = "Attachment format",
  disabled = false,
}: {
  value: DocumentFormat;
  onChange: (format: DocumentFormat) => void;
  label?: string;
  disabled?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
        {label}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {DOCUMENT_FORMATS.map((format) => {
          const active = format === value;
          return (
            <label
              key={format}
              className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 ${
                active ? "border-accent bg-bg-violet" : "border-line bg-surface hover:border-accent/50"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name={name}
                value={format}
                checked={active}
                onChange={() => onChange(format)}
                className="sr-only"
              />
              <FormatIcon format={format} active={active} />
              <span className="min-w-0">
                <span className="block font-display text-[13px] font-semibold text-ink">
                  {DOCUMENT_FORMAT_LABELS[format]}
                  {format === "pdf" && (
                    <span className="ml-1.5 font-normal text-[11px] text-accent-deep">recommended</span>
                  )}
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-[1.5] text-body">
                  {DOCUMENT_FORMAT_HINTS[format]}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function FormatIcon({ format, active }: { format: DocumentFormat; active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-display text-[8.5px] font-bold tracking-[0.04em] ${
        active ? "border-accent/40 bg-surface text-accent-deep" : "border-line bg-bg text-muted"
      }`}
    >
      {format === "pdf" ? "PDF" : "DOC"}
    </span>
  );
}
