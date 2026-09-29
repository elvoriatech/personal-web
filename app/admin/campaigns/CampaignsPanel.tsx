"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SEND_JOB_POLL_MS } from "@/lib/campaigns/constants";
import type { CampaignTemplate, SendJob } from "@/lib/campaigns/types";
import type { MailStatus } from "@/lib/mail/transports";
import { api, type Stats } from "./_components/api";
import { JobProgress } from "./_components/JobProgress";
import { RecipientsTable } from "./_components/RecipientsTable";
import { SendComposer, type SendRequest } from "./_components/SendComposer";
import { useRecipientList, type RecipientPage } from "./_components/useRecipientList";

export function CampaignsPanel({
  configured,
  initialPage,
  initialStats,
  initialJob,
  templates,
  mail,
}: {
  configured: boolean;
  initialPage: RecipientPage;
  initialStats: Stats;
  initialJob: SendJob | null;
  templates: CampaignTemplate[];
  mail: MailStatus;
}) {
  const list = useRecipientList({ configured, initialPage, initialStats });
  const { page, query, stats, selected, setSelected, busy, notice, setNotice, run, refresh } = list;
  const [job, setJob] = useState<SendJob | null>(initialJob);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
  }, [job, refresh, setNotice]);

  /* ------------------------------- handlers ------------------------------- */

  const send = async (req: SendRequest) =>
    run("Send failed.", async () => {
      const res = await api<{ job: SendJob }>("/api/admin/campaigns/jobs", {
        method: "POST",
        body: JSON.stringify({
          templateType: req.templateType,
          theme: req.theme,
          transport: req.transport,
          autoFollowUp: req.autoFollowUp,
          selectionMode: req.mode === "selected" ? "recipient_ids" : "all_not_sent",
          recipientIds: req.mode === "selected" ? [...selected] : undefined,
        }),
      });
      setJob(res.job);
      if (req.mode === "selected") setSelected(new Set());
      return `Queued ${res.job.totalCount} ${res.job.totalCount === 1 ? "email" : "emails"}. Progress is shown above.`;
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

      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-[13px] text-body">
        Adding or editing companies happens on the{" "}
        <Link href="/admin/companies" className="font-semibold text-accent-deep underline-offset-2 hover:underline">
          Companies page →
        </Link>
      </p>

      <SendComposer
        templates={templates}
        mail={mail}
        stats={stats}
        selectedCount={selected.size}
        busy={busy}
        jobActive={jobActive}
        onSend={send}
        onAudit={list.audit}
      />

      <RecipientsTable
        rows={page.rows}
        total={page.total}
        query={query}
        stats={stats}
        selected={selected}
        busy={busy}
        onQuery={list.updateQuery}
        onToggle={list.toggle}
        onSelectPage={list.selectPage}
        onClearSelection={() => setSelected(new Set())}
        onBulk={list.bulk}
      />
    </div>
  );
}
