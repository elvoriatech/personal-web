"use client";

import type { DocumentFormat } from "@/lib/documents/types";

/**
 * Downloads a document built from the editor's CURRENT state, saved or not.
 *
 * A plain form POST to the documents route: the response carries
 * Content-Disposition: attachment, so the browser saves the file and stays on
 * the page — no fetch/blob juggling, and it works inside a <dialog>.
 */
export function DownloadCurrentButton({
  doc,
  payload,
  variant,
  format = "pdf",
  children,
  className,
}: {
  doc: "resume" | "cover-letter";
  /** The document object as the editor holds it. */
  payload: unknown;
  variant?: "ats" | "design" | "compact";
  /** PDF unless the caller asks for Word. */
  format?: DocumentFormat;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form method="post" action={`/api/documents/${doc}`} className="inline">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />
      {variant && <input type="hidden" name="variant" value={variant} />}
      <input type="hidden" name="format" value={format} />
      <button
        type="submit"
        className={
          className ??
          "inline-flex min-h-[34px] items-center rounded-pill border border-accent bg-accent px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-accent-deep"
        }
      >
        {children}
      </button>
    </form>
  );
}
