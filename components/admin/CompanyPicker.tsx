"use client";

import { useId, useMemo, useRef, useState } from "react";

export type PickableCompany = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  website: string;
  industry: string;
  /** Why this company cannot be emailed, or "" when it can. */
  blocked: string;
};

const MAX_OPTIONS = 50;

/**
 * Type-to-filter company chooser (WAI-ARIA combobox with a listbox popup).
 * Companies that must not be emailed stay visible but disabled, with the
 * reason, so the admin is not left wondering where a company went.
 *
 * It lives inside the template editor's save <form>, so Enter never submits.
 */
export function CompanyPicker({
  companies,
  value,
  onChange,
  label = "Send to",
}: {
  companies: PickableCompany[];
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selected = companies.find((c) => c.id === value) ?? null;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = q
      ? companies.filter((c) =>
          [c.companyName, c.contactName, c.email, c.website].some((f) => f.toLowerCase().includes(q))
        )
      : companies;
    return hits.slice(0, MAX_OPTIONS);
  }, [companies, query]);

  function choose(c: PickableCompany) {
    if (c.blocked) return;
    onChange(c.id);
    setOpen(false);
    setQuery("");
  }

  function move(delta: number) {
    if (!matches.length) return;
    setOpen(true);
    setActive((i) => (i + delta + matches.length) % matches.length);
  }

  if (companies.length === 0) {
    return (
      <p className="text-[12.5px] text-body">
        No companies yet —{" "}
        <a href="/admin/companies" className="font-semibold text-accent-deep underline-offset-2 hover:underline">
          add one on the Companies page
        </a>{" "}
        to send this template.
      </p>
    );
  }

  if (selected) {
    return (
      <div>
        <p className="mb-1.5 font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">{label}</p>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/40 bg-bg-violet px-3.5 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[13.5px] font-semibold text-ink">
              {selected.companyName || selected.email}
            </p>
            <p className="truncate text-[12px] text-body">
              {[selected.contactName, selected.email].filter(Boolean).join(" · ")}
              {selected.website && (
                <>
                  {" · "}
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-deep underline-offset-2 hover:underline"
                  >
                    {selected.website.replace(/^https?:\/\//, "")}
                  </a>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className="min-h-[32px] rounded-pill border border-line bg-surface px-3.5 text-[11.5px] font-semibold text-body hover:border-accent hover:text-accent-deep"
          >
            Change<span className="sr-only"> company</span>
          </button>
        </div>
      </div>
    );
  }

  const activeOption = open ? matches[active] : undefined;

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOption ? `${listId}-${activeOption.id}` : undefined}
        autoComplete="off"
        value={query}
        placeholder="Search a company, contact or email"
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Enter") {
            // Never submit the surrounding save form from here.
            e.preventDefault();
            if (open && activeOption) choose(activeOption);
          } else if (e.key === "Escape" && open) {
            // Close the list without also closing a dialog around us.
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          }
        }}
        className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:border-accent"
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Companies"
          className="absolute z-20 mt-1 max-h-[300px] w-full overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-xl"
        >
          {matches.length === 0 ? (
            <li className="px-3.5 py-2.5 text-[12.5px] text-muted">Nothing matches “{query}”.</li>
          ) : (
            matches.map((c, i) => (
              <li
                key={c.id}
                id={`${listId}-${c.id}`}
                role="option"
                aria-selected={i === active}
                aria-disabled={c.blocked ? true : undefined}
                // mousedown, not click: it lands before the input's blur closes the list.
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(c);
                }}
                onMouseEnter={() => setActive(i)}
                className={`px-3.5 py-2 ${c.blocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${
                  i === active ? "bg-bg-violet" : ""
                }`}
              >
                <span className="block truncate text-[13px] font-semibold text-ink">{c.companyName || c.email}</span>
                <span className="block truncate text-[11.5px] text-body">
                  {[c.contactName, c.email].filter(Boolean).join(" · ")}
                </span>
                {c.blocked && <span className="block text-[11px] font-semibold text-red-700">{c.blocked}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
