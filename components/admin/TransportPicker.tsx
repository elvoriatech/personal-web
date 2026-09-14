"use client";

import { useId } from "react";
import { TRANSPORT_LABELS, type MailStatus, type MailTransport } from "@/lib/mail/transports";

/** Radio row for choosing which account an email leaves from. */
export function TransportPicker({
  available,
  value,
  onChange,
  label = "Send from",
}: {
  available: MailStatus["available"];
  value: MailTransport | null;
  onChange: (t: MailTransport) => void;
  label?: string;
}) {
  const name = useId();
  if (available.length === 0) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-800">
        No sending account is set up — connect Hotmail under <em>Send an email</em> or set{" "}
        <code>RESEND_API_KEY</code>.
      </p>
    );
  }
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
        {label}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {available.map((t) => {
          const active = t.id === value;
          return (
            <label
              key={t.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 ${
                active ? "border-accent bg-bg-violet" : "border-line bg-surface hover:border-accent/50"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={t.id}
                checked={active}
                onChange={() => onChange(t.id)}
                className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
              />
              <span className="min-w-0">
                <span className="block font-display text-[13px] font-semibold text-ink">{TRANSPORT_LABELS[t.id]}</span>
                <span className="block truncate text-[12px] text-body" title={t.from}>{t.from}</span>
                <span className="mt-0.5 block text-[11.5px] leading-[1.5] text-muted">{t.note}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
