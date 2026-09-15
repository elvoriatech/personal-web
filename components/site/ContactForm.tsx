"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";
import { submitContact } from "@/app/actions/contact";
import { BUDGET_OPTIONS, initialContactState, type ContactState } from "@/lib/contactState";
import { ArrowRight, Button } from "@/components/ui/Button";

/* No `focus:outline-none` here — it would suppress the global :focus-visible
   ring and leave keyboard users with only a subtle border-colour change. */
const fieldBase =
  "w-full rounded-xl border bg-surface px-4 py-3 text-[14px] text-ink placeholder:text-muted/80 " +
  "transition-colors focus:border-accent";
const labelBase =
  "mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-body";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Sending…" : "Send project"}
      {!pending && <ArrowRight />}
    </Button>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-[12px] text-red-600">
      {message}
    </p>
  );
}

/**
 * A short lead form: enough to qualify a project before the first call,
 * short enough that a busy founder still fills it in.
 */
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
  const border = (key: keyof NonNullable<typeof err>) =>
    err?.[key] ? "border-red-400" : "border-line";

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className={labelBase}>Name</label>
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
            className={`${fieldBase} ${border("name")}`}
          />
          <FieldError id={`${uid}-name-error`} message={err?.name} />
        </div>

        <div>
          <label htmlFor={`${uid}-email`} className={labelBase}>Work email</label>
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
            className={`${fieldBase} ${border("email")}`}
          />
          <FieldError id={`${uid}-email-error`} message={err?.email} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-company`} className={labelBase}>
            Company <span className="font-normal normal-case tracking-normal text-muted">(optional)</span>
          </label>
          <input
            id={`${uid}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            defaultValue={vals?.company ?? ""}
            placeholder="Company or project name"
            aria-invalid={Boolean(err?.company)}
            aria-describedby={err?.company ? `${uid}-company-error` : undefined}
            className={`${fieldBase} ${border("company")}`}
          />
          <FieldError id={`${uid}-company-error`} message={err?.company} />
        </div>

        <div>
          <label htmlFor={`${uid}-budget`} className={labelBase}>Approximate budget</label>
          <select
            id={`${uid}-budget`}
            name="budget"
            required
            defaultValue={vals?.budget ?? ""}
            aria-invalid={Boolean(err?.budget)}
            aria-describedby={err?.budget ? `${uid}-budget-error` : undefined}
            className={`${fieldBase} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%235F5A68' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")] bg-[length:14px_14px] bg-[position:right_14px_center] bg-no-repeat pr-10 ${border("budget")}`}
          >
            <option value="" disabled>
              Choose a range
            </option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldError id={`${uid}-budget-error`} message={err?.budget} />
        </div>
      </div>

      <div>
        <label htmlFor={`${uid}-message`} className={labelBase}>
          What do you want to build or automate?
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={4}
          required
          defaultValue={vals?.message ?? ""}
          placeholder="The workflow, the idea, or the problem — a few lines is plenty."
          aria-invalid={Boolean(err?.message)}
          aria-describedby={err?.message ? `${uid}-message-error` : undefined}
          className={`${fieldBase} resize-y ${border("message")}`}
        />
        <FieldError id={`${uid}-message-error`} message={err?.message} />
      </div>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
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
      <p className="text-[12px] leading-[1.6] text-muted">
        Your details are used only to reply to you. No newsletter, no sharing.
      </p>
    </form>
  );
}
