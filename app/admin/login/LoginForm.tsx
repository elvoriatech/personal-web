"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type AuthState } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="accent-gradient mt-4 min-h-[44px] w-full rounded-pill font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60"
    >
      {pending ? "Checking…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<AuthState, FormData>(login, { error: "" });

  return (
    <form action={action} className="mt-5">
      <label
        htmlFor="password"
        className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-body"
      >
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        aria-invalid={Boolean(state.error)}
        aria-describedby={state.error ? "login-error" : undefined}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[14px] text-ink"
      />
      {state.error && (
        <p id="login-error" role="alert" className="mt-2 text-[12.5px] text-red-600">
          {state.error}
        </p>
      )}
      <Submit />
    </form>
  );
}
