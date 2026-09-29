"use client";

import { useId } from "react";
import { CompanyPicker, type PickableCompany } from "@/components/admin/CompanyPicker";
import { EXTRA_PLACEHOLDER_HINTS } from "@/lib/campaigns/outreachVars";

export type SendTarget = { recipientId: string | null; extras: Record<string, string> };

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/**
 * The "Send to" strip on each template card: choose a company, fill anything
 * the company record can't (e.g. {{observation}}), then preview and send.
 */
export function SendToCompany({
  companies,
  target,
  onChange,
  extras,
  lastSentAt,
  onPreview,
}: {
  companies: PickableCompany[];
  target: SendTarget;
  onChange: (next: SendTarget) => void;
  /** Placeholders in this template that need a value per send. */
  extras: string[];
  /** When this company last received this template, if ever. */
  lastSentAt: string | null;
  onPreview: () => void;
}) {
  const selected = companies.find((c) => c.id === target.recipientId) ?? null;
  const missing = extras.filter((k) => !target.extras[k]?.trim());

  return (
    <div className="space-y-3 rounded-xl border border-line bg-bg-tint/60 p-4">
      <CompanyPicker
        companies={companies}
        value={target.recipientId}
        onChange={(recipientId) => onChange({ ...target, recipientId })}
      />

      {selected && extras.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {extras.map((key) => (
            <ExtraField
              key={key}
              name={key}
              value={target.extras[key] ?? ""}
              onChange={(v) => onChange({ ...target, extras: { ...target.extras, [key]: v } })}
            />
          ))}
        </div>
      )}

      {selected && lastSentAt && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          {selected.companyName || selected.email} already received this template on{" "}
          {dateFmt.format(new Date(lastSentAt))}. Sending again is allowed, but a follow-up usually lands better.
        </p>
      )}

      {selected && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPreview}
            className="accent-gradient min-h-[40px] rounded-pill px-5 font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-white"
          >
            Preview &amp; send
          </button>
          {missing.length > 0 && (
            <p className="text-[12px] text-muted">
              Fill in {missing.map((m) => EXTRA_PLACEHOLDER_HINTS[m]?.label.toLowerCase() ?? m).join(", ")} to enable sending.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ExtraField({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  const meta = EXTRA_PLACEHOLDER_HINTS[name];
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
        {meta?.label ?? name} <span className="font-mono normal-case tracking-normal text-muted">{`{{${name}}}`}</span>
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Inside the template save form: Enter must not save or submit.
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        autoComplete="off"
        className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:border-accent"
      />
      {meta?.hint && <p className="mt-1 text-[11.5px] text-muted">{meta.hint}</p>}
    </div>
  );
}
