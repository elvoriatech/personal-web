"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RECIPIENTS_PAGE_SIZE, SEND_JOB_POLL_MS } from "@/lib/campaigns/constants";
import type { CampaignTemplate, Recipient, RecipientInput, SendJob } from "@/lib/campaigns/types";
import { AddRecipients } from "./_components/AddRecipients";
import { api, recipientsUrl, type Notice, type RecipientQuery, type Stats } from "./_components/api";
import { JobProgress } from "./_components/JobProgress";
import { RecipientsTable, type BulkAction } from "./_components/RecipientsTable";
import { SendComposer, type SendRequest } from "./_components/SendComposer";

type Page = { rows: Recipient[]; total: number };

const INITIAL_QUERY: RecipientQuery = {
  filter: "all",
  search: "",
  page: 1,
  pageSize: RECIPIENTS_PAGE_SIZE,
};

export function CampaignsPanel({
  configured,
  initialPage,
  initialStats,
  initialJob,
  templates,
}: {
  configured: boolean;
  initialPage: Page;
  initialStats: Stats;
  initialJob: SendJob | null;
  templates: CampaignTemplate[];
}) {
  const [page, setPage] = useState<Page>(initialPage);
  const [query, setQuery] = useState<RecipientQuery>(INITIAL_QUERY);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [job, setJob] = useState<SendJob | null>(initialJob);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // The latest query wins: a slow response for an old page must not overwrite
  // the rows for the page the user has since moved to.
  const requestSeq = useRef(0);

  const load = useCallback(
    async (q: RecipientQuery) => {
      if (!configured) return;
      const seq = ++requestSeq.current;
      try {
        const data = await api<Page & { stats: Stats }>(recipientsUrl(q));
        if (seq !== requestSeq.current) return;
        setPage({ rows: data.rows, total: data.total });
        setStats(data.stats);
      } catch (err) {
        if (seq !== requestSeq.current) return;
        setNotice({ tone: "error", text: err instanceof Error ? err.message : "Could not load recipients." });
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

  /* While a job is active, keep draining it and polling progress. The browser
     tab is the worker in development; in production Vercel Cron does this. */
  useEffect(() => {
    const active = job && (job.status === "queued" || job.status === "running");
    if (!active) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const res = await api<{ job: SendJob | null }>("/api/admin/campaigns/jobs", {
          method: "POST",
          body: JSON.stringify({ action: "process" }),
        });
        setJob(res.job);
        if (res.job && res.job.status !== "running" && res.job.status !== "queued") void refresh();
      } catch (err) {
        setNotice({ tone: "error", text: err instanceof Error ? err.message : "Send worker failed." });
      }
    }, SEND_JOB_POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [job, refresh]);

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

  /* ------------------------------- handlers ------------------------------- */

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

  const send = async (req: SendRequest) =>
    run("Send failed.", async () => {
      const res = await api<{ job: SendJob }>("/api/admin/campaigns/jobs", {
        method: "POST",
        body: JSON.stringify({
          templateType: req.templateType,
          theme: req.theme,
          autoFollowUp: req.autoFollowUp,
          selectionMode: req.mode === "selected" ? "recipient_ids" : "all_not_sent",
          recipientIds: req.mode === "selected" ? [...selected] : undefined,
        }),
      });
      setJob(res.job);
      if (req.mode === "selected") setSelected(new Set());
      return `Queued ${res.job.totalCount} ${res.job.totalCount === 1 ? "email" : "emails"}. Progress is shown above.`;
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
        : "Every recipient's domain has been checked.";
    });

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
        delete: `Deleted ${n} ${n === 1 ? "recipient" : "recipients"}.`,
        mark_replied: `${n} marked as replied — their follow-ups are cancelled.`,
        reset: `${n} reset to not sent.`,
      }[action];
    });

  const cancelJob = () =>
    run("Cancel failed.", async () => {
      if (!job) return null;
      const res = await api<{ job: SendJob | null }>("/api/admin/campaigns/jobs", {
        method: "POST",
        body: JSON.stringify({ action: "cancel", jobId: job.id }),
      });
      setJob(res.job);
      return "Send cancelled. Emails already sent are unaffected.";
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

  /* -------------------------------- render -------------------------------- */

  if (!configured) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
        Campaigns need Postgres. Set <code>DATABASE_URL</code> and apply{" "}
        <code>lib/db/schema.sql</code>, then reload.
      </p>
    );
  }

  const jobActive = Boolean(job && (job.status === "queued" || job.status === "running"));

  return (
    <div className="space-y-5">
      {job && <JobProgress job={job} onCancel={cancelJob} busy={busy} />}

      {notice && (
        <p
          role="status"
          className={`rounded-xl px-4 py-2.5 text-[13px] ${
            notice.tone === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      <AddRecipients busy={busy} onImport={importRecipients} />

      <SendComposer
        templates={templates}
        stats={stats}
        selectedCount={selected.size}
        busy={busy}
        jobActive={jobActive}
        onSend={send}
        onAudit={audit}
      />

      <RecipientsTable
        rows={page.rows}
        total={page.total}
        query={query}
        stats={stats}
        selected={selected}
        busy={busy}
        onQuery={updateQuery}
        onToggle={toggle}
        onSelectPage={selectPage}
        onClearSelection={() => setSelected(new Set())}
        onBulk={bulk}
      />
    </div>
  );
}
