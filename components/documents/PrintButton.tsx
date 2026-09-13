"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="accent-gradient inline-flex min-h-[40px] items-center gap-2 rounded-pill px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-white"
    >
      Print / Save PDF
    </button>
  );
}
