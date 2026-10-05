"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A confirmation popup for destructive actions — every permanent delete in
 * the admin goes through this one dialog so they all look and behave alike.
 *
 * Built on the native <dialog>: focus is trapped, the page behind is inert,
 * and Esc or a click on the backdrop cancels. Focus starts on Cancel, so a
 * stray Enter never deletes anything.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Delete",
  busy = false,
  error = "",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  /** What will happen, in a sentence or two. */
  children?: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  /** Shown inside the dialog when the action failed, so the admin can retry. */
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      cancelRef.current?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  const cancel = () => {
    if (!busy) onCancel();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-dialog-title"
      onCancel={(e) => {
        // Native Esc: keep the dialog in sync with React state instead.
        e.preventDefault();
        cancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current) cancel();
      }}
      className="m-auto w-[min(100vw-32px,420px)] rounded-card border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m2 0-.6 9.1A2 2 0 0 1 11.4 17H8.6a2 2 0 0 1-2-1.9L6 6M8.5 9v5M11.5 9v5" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 id="confirm-dialog-title" className="font-display text-[16px] font-semibold text-ink">
              {title}
            </h2>
            {children && <div className="mt-1.5 text-[13px] leading-[1.6] text-body">{children}</div>}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-800">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2.5">
          <button
            ref={cancelRef}
            type="button"
            onClick={cancel}
            disabled={busy}
            className="min-h-[42px] rounded-pill border border-line bg-surface px-5 text-[12.5px] font-semibold text-body hover:border-accent hover:text-accent-deep disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="min-h-[42px] rounded-pill bg-red-600 px-5 text-[12.5px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
