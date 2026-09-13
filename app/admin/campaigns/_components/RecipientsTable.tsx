"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RECIPIENTS_PAGE_SIZES } from "@/lib/campaigns/constants";
import { TEMPLATE_LABELS, type Recipient } from "@/lib/campaigns/types";
import { formatDate, type RecipientFilter, type RecipientQuery, type Stats } from "./api";

const FILTERS: { id: RecipientFilter; label: string; statKey: string | null }[] = [
  { id: "all", label: "All", statKey: null },
  { id: "not_sent", label: "Not sent", statKey: "not_sent" },
  { id: "sent", label: "Sent", statKey: "sent" },
  { id: "replied", label: "Replied", statKey: "replied" },
  { id: "bounced", label: "Bounced", statKey: "bounced" },
  { id: "opted_out", label: "Opted out", statKey: "opted_out" },
];

const STATUS_TONE: Record<Recipient["status"], string> = {
  not_sent: "bg-neutral-100 text-neutral-700",
  sent: "bg-blue-50 text-blue-700",
  replied: "bg-green-50 text-green-700",
  bounced: "bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<Recipient["status"], string> = {
  not_sent: "Not sent",
  sent: "Sent",
  replied: "Replied",
  bounced: "Bounced",
};

export type BulkAction = "opt_out" | "opt_in" | "delete" | "mark_replied" | "reset";

export function RecipientsTable({
  rows,
  total,
  query,
  stats,
  selected,
  busy,
  onQuery,
  onToggle,
  onSelectPage,
  onClearSelection,
  onBulk,
}: {
  rows: Recipient[];
  total: number;
  query: RecipientQuery;
  stats: Stats;
  selected: Set<string>;
  busy: boolean;
  onQuery: (next: Partial<RecipientQuery>) => void;
  onToggle: (id: string) => void;
  onSelectPage: (ids: string[], select: boolean) => void;
  onClearSelection: () => void;
  onBulk: (action: BulkAction) => void;
}) {
  const [searchDraft, setSearchDraft] = useState(query.search);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Debounce typing into a single query change; the parent does the fetch.
  useEffect(() => {
    if (searchDraft === query.search) return;
    const t = setTimeout(() => onQuery({ search: searchDraft, page: 1 }), 350);
    return () => clearTimeout(t);
  }, [searchDraft, query.search, onQuery]);

  const totalAll = Object.entries(stats)
    .filter(([k]) => ["not_sent", "sent", "replied", "bounced"].includes(k))
    .reduce((sum, [, v]) => sum + v, 0);

  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const first = total === 0 ? 0 : (query.page - 1) * query.pageSize + 1;
  const last = Math.min(total, query.page * query.pageSize);
  const pageIds = rows.map((r) => r.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPageSelected = pageIds.some((id) => selected.has(id));

  return (
    <section className="card-surface p-6">
      {/* ------------------------------ header ------------------------------ */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[14px] font-semibold text-ink">Recipients</h2>
          <p className="mt-0.5 text-[12px] text-muted">
            {totalAll} in your list
            {query.filter !== "all" || query.search ? ` · ${total} match this view` : ""}
          </p>
        </div>
        <label className="relative block w-full sm:w-[260px]">
          <span className="sr-only">Search recipients</span>
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted"
          >
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search company, name or email"
            className="w-full rounded-pill border border-line bg-surface py-2 pr-3.5 pl-9 text-[13px] text-ink placeholder:text-muted focus:border-accent"
          />
        </label>
      </div>

      {/* ------------------------------ filters ----------------------------- */}
      <div role="group" aria-label="Filter by status" className="mt-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = query.filter === f.id;
          const count = f.statKey ? (stats[f.statKey] ?? 0) : totalAll;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => onQuery({ filter: f.id, page: 1 })}
              className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-pill border px-3 text-[12px] font-semibold transition-colors ${
                active
                  ? "border-accent bg-bg-violet text-accent-deep"
                  : "border-line bg-surface text-body hover:border-accent/50 hover:text-ink"
              }`}
            >
              {f.label}
              <span
                className={`rounded-pill px-1.5 py-px text-[10.5px] tabular-nums ${
                  active ? "bg-accent/15 text-accent-deep" : "bg-bg-tint text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* --------------------------- selection bar -------------------------- */}
      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-bg-violet px-4 py-2.5">
          <p className="text-[12.5px] text-ink">
            <span className="font-semibold">{selected.size}</span> selected
            <button
              type="button"
              onClick={onClearSelection}
              className="ml-3 text-[12px] font-semibold text-accent-deep underline-offset-2 hover:underline"
            >
              Clear
            </button>
          </p>
          {confirmDelete ? (
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-red-800">
              Delete {selected.size} recipient{selected.size === 1 ? "" : "s"}? This cannot be undone.
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setConfirmDelete(false);
                  onBulk("delete");
                }}
                className="min-h-[32px] rounded-pill bg-red-600 px-3.5 text-[11.5px] font-semibold text-white disabled:opacity-50"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="min-h-[32px] rounded-pill border border-line bg-surface px-3.5 text-[11.5px] font-semibold text-body"
              >
                Keep
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <Action onClick={() => onBulk("mark_replied")} disabled={busy}>Mark replied</Action>
              <Action onClick={() => onBulk("reset")} disabled={busy}>Reset to not sent</Action>
              {query.filter === "opted_out" ? (
                <Action onClick={() => onBulk("opt_in")} disabled={busy}>Undo opt-out</Action>
              ) : (
                <Action onClick={() => onBulk("opt_out")} disabled={busy}>Opt out</Action>
              )}
              <Action tone="danger" onClick={() => setConfirmDelete(true)} disabled={busy}>
                Delete
              </Action>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------- table ------------------------------ */}
      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-[13px] text-body">
          {totalAll === 0
            ? "No recipients yet. Add a company above to get started."
            : query.search
              ? `Nothing matches “${query.search}”.`
              : `No recipients are ${FILTERS.find((f) => f.id === query.filter)?.label.toLowerCase()}.`}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-[10.5px] uppercase tracking-[0.1em] text-muted">
                <th scope="col" className="w-9 py-2">
                  <input
                    type="checkbox"
                    aria-label={allOnPageSelected ? "Deselect all on this page" : "Select all on this page"}
                    checked={allOnPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected;
                    }}
                    onChange={(e) => onSelectPage(pageIds, e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                </th>
                <th scope="col" className="py-2">Company</th>
                <th scope="col" className="py-2">Email</th>
                <th scope="col" className="py-2">Industry</th>
                <th scope="col" className="py-2">Status</th>
                <th scope="col" className="py-2">Domain</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const lastSent = r.followUp2SentAt ?? r.followUp1SentAt ?? r.initialSentAt;
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-line/60 align-top ${
                      selected.has(r.id) ? "bg-bg-violet/60" : ""
                    } ${r.optedOut ? "opacity-70" : ""}`}
                  >
                    <td className="py-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Select ${r.companyName || r.email}`}
                        checked={selected.has(r.id)}
                        onChange={() => onToggle(r.id)}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-ink">{r.companyName || <span className="text-muted">—</span>}</p>
                      {r.contactName && <p className="text-[11.5px] text-muted">{r.contactName}</p>}
                    </td>
                    <td className="py-2.5 pr-3 text-body">
                      <span className="break-all">{r.email}</span>
                      {r.optedOut && (
                        <span className="ml-2 rounded-pill bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-700">
                          opted out
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-body">{r.industry || <span className="text-muted">—</span>}</td>
                    <td className="py-2.5 pr-3">
                      <span className={`rounded-pill px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_TONE[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                      {lastSent && (
                        <p className="mt-1 text-[11px] text-muted">
                          {r.lastTemplateType ? TEMPLATE_LABELS[r.lastTemplateType] : "Sent"} · {formatDate(lastSent)}
                        </p>
                      )}
                      {r.status === "bounced" && r.bounceReason && (
                        <p className="mt-1 max-w-[220px] text-[11px] text-red-700">{r.bounceReason}</p>
                      )}
                    </td>
                    <td className="py-2.5 text-muted">
                      {r.domainStatus === "invalid" ? (
                        <span className="font-semibold text-red-600">invalid</span>
                      ) : r.domainStatus === "ok" || r.domainStatus === "ok_fallback" ? (
                        <span className="text-green-700">ok</span>
                      ) : (
                        <span>unchecked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ----------------------------- pagination --------------------------- */}
      {total > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[12.5px] text-body">
          <p>
            Showing <span className="font-semibold text-ink">{first}–{last}</span> of{" "}
            <span className="font-semibold text-ink">{total}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-muted">Per page</span>
              <select
                value={query.pageSize}
                onChange={(e) => onQuery({ pageSize: Number(e.target.value), page: 1 })}
                className="rounded-pill border border-line bg-surface px-2.5 py-1 text-[12.5px] text-ink"
              >
                {RECIPIENTS_PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <nav aria-label="Pagination" className="flex items-center gap-1">
              <PageButton
                label="Previous page"
                disabled={query.page <= 1 || busy}
                onClick={() => onQuery({ page: query.page - 1 })}
              >
                ‹
              </PageButton>
              <span className="min-w-[80px] text-center tabular-nums">
                Page {query.page} of {pageCount}
              </span>
              <PageButton
                label="Next page"
                disabled={query.page >= pageCount || busy}
                onClick={() => onQuery({ page: query.page + 1 })}
              >
                ›
              </PageButton>
            </nav>
          </div>
        </div>
      )}
    </section>
  );
}

function Action({
  children,
  onClick,
  disabled,
  tone = "neutral",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "neutral" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-[32px] items-center rounded-pill border bg-surface px-3 text-[11.5px] font-semibold transition-colors disabled:opacity-50 ${
        tone === "danger"
          ? "border-red-200 text-red-700 hover:bg-red-50"
          : "border-line text-body hover:border-accent hover:text-accent-deep"
      }`}
    >
      {children}
    </button>
  );
}

function PageButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-pill border border-line bg-surface text-[15px] text-body hover:border-accent hover:text-accent-deep disabled:opacity-40 disabled:hover:border-line disabled:hover:text-body"
    >
      {children}
    </button>
  );
}
