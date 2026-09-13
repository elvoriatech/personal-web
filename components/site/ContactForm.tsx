"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";
import { submitContact } from "@/app/actions/contact";
import { initialContactState, type ContactState } from "@/lib/contactState";
import { ArrowRight, Button } from "@/components/ui/Button";

/* No `focus:outline-none` here — it would suppress the global :focus-visible
   ring and leave keyboard users with only a subtle border-colour change. */
const fieldBase =
  "w-full rounded-xl border bg-surface px-4 py-3 text-[14px] text-ink placeholder:text-muted/80 " +
  "transition-colors focus:border-accent";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Sending…" : "Send Message"}
      {!pending && <ArrowRight />}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContact,
    initialContactState
  );
  const uid = useId();

  const err = state.fieldErrors;
  /* React resets uncontrolled fields after an action; re-seeding defaultValue
     from the echoed values keeps the visitor's text after a failed send. */
  const vals = state.values;

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${uid}-name`}
            className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-body"
          >
            Name
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            defaultValue={vals?.name ?? ""}
            placeholder="Your name"
            aria-invalid={Boolean(err?.name)}
            aria-describedby={err?.name ? `${uid}-name-error` : undefined}
            className={`${fieldBase} ${err?.name ? "border-red-400" : "border-line"}`}
          />
          {err?.name && (
            <p id={`${uid}-name-error`} className="mt-1.5 text-[12px] text-red-600">
              {err.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`${uid}-email`}
            className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-body"
          >
            Email
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={vals?.email ?? ""}
            placeholder="you@company.com"
            aria-invalid={Boolean(err?.email)}
            aria-describedby={err?.email ? `${uid}-email-error` : undefined}
            className={`${fieldBase} ${err?.email ? "border-red-400" : "border-line"}`}
          />
          {err?.email && (
            <p id={`${uid}-email-error`} className="mt-1.5 text-[12px] text-red-600">
              {err.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={`${uid}-message`}
          className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-body"
        >
          Message
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={4}
          required
          defaultValue={vals?.message ?? ""}
          placeholder="Tell me about your project…"
          aria-invalid={Boolean(err?.message)}
          aria-describedby={err?.message ? `${uid}-message-error` : undefined}
          className={`${fieldBase} resize-y ${err?.message ? "border-red-400" : "border-line"}`}
        />
        {err?.message && (
          <p id={`${uid}-message-error`} className="mt-1.5 text-[12px] text-red-600">
            {err.message}
          </p>
        )}
      </div>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input id={`${uid}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <SubmitButton />
        <p
          role="status"
          aria-live="polite"
          className={`text-[13px] ${
            state.status === "success"
              ? "text-green-700"
              : state.status === "error"
                ? "text-red-600"
                : "text-body"
          }`}
        >
          {state.message}
        </p>
      </div>
    </form>
  );
}
