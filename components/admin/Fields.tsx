"use client";

import { useId, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { SaveState } from "@/app/admin/actions";

const control =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink " +
  "focus:border-accent";

export function Field({
  label,
  value,
  onChange,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  type?: string;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={control}
      />
      {hint && <p className="mt-1 text-[11.5px] text-muted">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  hint,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  mono?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${control} resize-y leading-[1.6] ${mono ? "font-mono text-[12.5px]" : ""}`}
      />
      {hint && <p className="mt-1 text-[11.5px] text-muted">{hint}</p>}
    </div>
  );
}

export function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="card-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-[14px] font-semibold text-ink">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SmallButton({
  children,
  onClick,
  tone = "neutral",
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "neutral" | "danger" | "primary";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[34px] items-center rounded-pill border px-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        tone === "danger"
          ? "border-red-200 text-red-700 hover:bg-red-50 disabled:hover:bg-transparent"
          : tone === "primary"
            ? "border-accent bg-accent text-white hover:bg-accent-deep disabled:hover:bg-accent"
            : "border-line text-body hover:border-accent hover:text-accent-deep disabled:hover:border-line disabled:hover:text-body"
      }`}
    >
      {children}
    </button>
  );
}

/** Sticky save bar; disables itself while the action is in flight. */
export function SaveBar({
  state,
  canSave,
  extra,
}: {
  state: SaveState;
  canSave: boolean;
  /** Rendered next to the save button — e.g. a Preview action. */
  extra?: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 z-10 -mx-1 mt-8 flex flex-wrap items-center gap-4 border-t border-line bg-bg-tint/95 px-1 py-4 backdrop-blur">
      <button
        type="submit"
        disabled={pending || !canSave}
        className="accent-gradient min-h-[44px] rounded-pill px-7 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
      {extra}
      <p
        role="status"
        aria-live="polite"
        className={`text-[13px] ${
          state.status === "saved"
            ? "text-green-700"
            : state.status === "error"
              ? "text-red-600"
              : "text-body"
        }`}
      >
        {!canSave
          ? "Saving is unavailable until a database is configured."
          : state.message}
      </p>
    </div>
  );
}
