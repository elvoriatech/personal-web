"use client";

import { useCallback, useRef, useState } from "react";
import { RECIPIENTS_PAGE_SIZE } from "@/lib/campaigns/constants";
import type { Recipient, RecipientInput } from "@/lib/campaigns/types";
import { api, recipientsUrl, type Notice, type RecipientQuery, type Stats } from "./api";
import type { BulkAction } from "./RecipientsTable";

export type RecipientPage = { rows: Recipient[]; total: number };

const INITIAL_QUERY: RecipientQuery = {
  filter: "all",
  search: "",
  page: 1,
  pageSize: RECIPIENTS_PAGE_SIZE,
};

/**
 * The company list shared by the Companies and Campaigns pages: paging,
 * search, selection, bulk actions and import, plus a busy flag and a notice.
 */
export function useRecipientList({
  configured,
  initialPage,
  initialStats,
}: {
  configured: boolean;
  initialPage: RecipientPage;
  initialStats: Stats;
}) {
  const [page, setPage] = useState<RecipientPage>(initialPage);
  const [query, setQuery] = useState<RecipientQuery>(INITIAL_QUERY);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  // The latest query wins: a slow response for an old page must not overwrite
  // the rows for the page the user has since moved to.
  const requestSeq = useRef(0);

  const load = useCallback(
    async (q: RecipientQuery) => {
      if (!configured) return;
      const seq = ++requestSeq.current;
      try {
        const data = await api<RecipientPage & { stats: Stats }>(recipientsUrl(q));
        if (seq !== requestSeq.current) return;
        setPage({ rows: data.rows, total: data.total });
        setStats(data.stats);
      } catch (err) {
        if (seq !== requestSeq.current) return;
        setNotice({ tone: "error", text: err instanceof Error ? err.message : "Could not load companies." });
      }
    },
    [configured]
  );

  const refresh = useCallback(() => load(query), [load, query]);

  const updateQuery = useCallback(
    (next: Partial<RecipientQuery>) => {
      const merged = { ...query, ...next };
      setQuery(merged);
      void load(merged);
    },
    [query, load]
  );

  async function run(fallback: string, fn: () => Promise<string | null>) {
    setBusy(true);
    setNotice(null);
    try {
      const text = await fn();
      if (text) setNotice({ tone: "ok", text });
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof Error ? err.message : fallback });
    } finally {
      setBusy(false);
    }
  }

  const importRecipients = async (recipients: RecipientInput[]) => {
    setBusy(true);
    try {
      const res = await api<{ inserted: number; updated: number; skipped: number }>(
        "/api/admin/campaigns/recipients",
        { method: "POST", body: JSON.stringify({ action: "import", recipients }) }
      );
      await load({ ...query, page: 1 });
      setQuery((q) => ({ ...q, page: 1 }));
      return res;
    } finally {
      setBusy(false);
    }
  };

  const bulk = (action: BulkAction) =>
    run("Update failed.", async () => {
      const ids = [...selected];
      const body =
        action === "mark_replied"
          ? { action: "set_status", ids, status: "replied" }
          : action === "reset"
            ? { action: "set_status", ids, status: "not_sent" }
            : { action, ids };
      await api("/api/admin/campaigns/recipients", { method: "POST", body: JSON.stringify(body) });
      setSelected(new Set());
      await refresh();
      const n = ids.length;
      return {
        opt_out: `${n} marked as opted out — they will never be emailed again.`,
        opt_in: `${n} opted back in.`,
        delete: `Deleted ${n} ${n === 1 ? "company" : "companies"}.`,
        mark_replied: `${n} marked as replied — their follow-ups are cancelled.`,
        reset: `${n} reset to not sent.`,
      }[action];
    });

  const removeOne = (r: Recipient) =>
    run("Delete failed.", async () => {
      await api("/api/admin/campaigns/recipients", {
        method: "POST",
        body: JSON.stringify({ action: "delete", ids: [r.id] }),
      });
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(r.id);
        return next;
      });
      await refresh();
      return `Deleted ${r.companyName || r.email}.`;
    });

  const audit = () =>
    run("Audit failed.", async () => {
      const res = await api<{ checked: number; invalid: number }>("/api/admin/campaigns/audit", {
        method: "POST",
        body: JSON.stringify({ limit: 50 }),
      });
      await refresh();
      return res.checked
        ? `Checked ${res.checked} domains — ${res.invalid} undeliverable. Run again to check more.`
        : "Every company's email domain has been checked.";
    });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectPage = (ids: string[], select: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (select) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  return {
    page,
    query,
    stats,
    selected,
    setSelected,
    busy,
    notice,
    setNotice,
    run,
    refresh,
    updateQuery,
    importRecipients,
    bulk,
    removeOne,
    audit,
    toggle,
    selectPage,
  };
}
