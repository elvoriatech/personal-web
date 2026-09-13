"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, SmallButton, TextArea } from "@/components/admin/Fields";
import { SEND_JOB_POLL_MS } from "@/lib/campaigns/constants";
import {
  TEMPLATE_LABELS,
  TEMPLATE_TYPES,
  type EmailTemplateType,
  type Recipient,
  type SendJob,
} from "@/lib/campaigns/types";

type Stats = Record<string, number>;

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

/** Accepts "email, name, company, industry" per line, with or without a header. */
function parseRecipientText(text: string) {
  const out: { email: string; contactName: string; companyName: string; industry: string }[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const cells = line.split(/[,;\t]/).map((c) => c.trim());
    const email = cells.find((c) => c.includes("@"));
    if (!email) continue; // silently drops a header row
    const rest = cells.filter((c) => c !== email);
    out.push({
      email,
      contactName: rest[0] ?? "",
      companyName: rest[1] ?? "",
      industry: rest[2] ?? "",
    });
  }
  return out;
}

const STATUS_TONE: Record<string, string> = {
  not_sent: "bg-neutral-100 text-neutral-700",
  sent: "bg-blue-50 text-blue-700",
  replied: "bg-green-50 text-green-700",
  bounced: "bg-red-50 text-red-700",
};

export function CampaignsPanel({
  configured,
  initialRows,
  initialStats,
  initialJob,
}: {
  configured: boolean;
  initialRows: Recipient[];
  initialStats: Stats;
  initialJob: SendJob | null;
}) {
  const [rows, setRows] = useState<Recipient[]>(initialRows);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [job, setJob] = useState<SendJob | null>(initialJob);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [importText, setImportText] = useState("");
  const [templateType, setTemplateType] = useState<EmailTemplateType>("initial");
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!configured) return;
    try {
      const data = await api<{ rows: Recipient[]; total: number; stats: Stats }>(
        "/api/admin/campaigns/recipients?limit=200"
      );
      setRows(data.rows);
      setStats(data.stats);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load recipients.");
    }
  }, [configured]);

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
        if (res.job && res.job.status !== "running" && res.job.status !== "queued") {
          void refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Send worker failed.");
      }
    }, SEND_JOB_POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [job, refresh]);

  async function run(label: string, fn: () => Promise<string>) {
    setBusy(true);
    setError("");
    setNote("");
    try {
      setNote(await fn());
    } catch (err) {
      setError(err instanceof Error ? err.message : `${label} failed.`);
    } finally {
      setBusy(false);
    }
  }

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!configured) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
        Campaigns need Postgres. Set <code>DATABASE_URL</code> and apply{" "}
        <code>lib/db/schema.sql</code>, then reload.
      </p>
    );
  }

  const active = job && (job.status === "queued" || job.status === "running");
  const pct = job && job.totalCount ? Math.round((job.processedIndex / job.totalCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* ------------------------------ progress ------------------------------ */}
      {job && (
        <div
          className={`rounded-card border p-4 ${
            active ? "border-accent/40 bg-bg-violet" : "border-line bg-surface"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-[13.5px] font-semibold text-ink">
              {TEMPLATE_LABELS[job.templateType]} — {job.status}
              {active && ` · ${job.processedIndex}/${job.totalCount}`}
            </p>
            {active && (
              <SmallButton
                tone="danger"
                onClick={() =>
                  run("Cancel", async () => {
                    const res = await api<{ job: SendJob | null }>("/api/admin/campaigns/jobs", {
                      method: "POST",
                      body: JSON.stringify({ action: "cancel", jobId: job.id }),
                    });
                    setJob(res.job);
                    return "Job cancelled.";
                  })
                }
              >
                Cancel
              </SmallButton>
            )}
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="accent-gradient h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-[12px] text-body">
            {job.sentCount} sent · {job.failedCount} failed
            {job.lastError && ` · ${job.lastError}`}
          </p>
        </div>
      )}

      {/* -------------------------------- stats ------------------------------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Not sent", stats.not_sent],
          ["Sent", stats.sent],
          ["Replied", stats.replied],
          ["Bounced", stats.bounced],
          ["Opted out", stats.opted_out],
          ["Bad domain", stats.invalid_domain],
        ].map(([label, value]) => (
          <div key={String(label)} className="card-surface px-4 py-3">
            <p className="font-display text-[18px] font-bold text-ink">{value ?? 0}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-muted">{label}</p>
          </div>
        ))}
      </div>

      {(note || error) && (
        <p
          role="status"
          className={`rounded-xl px-4 py-2.5 text-[13px] ${
            error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {error || note}
        </p>
      )}

      {/* ------------------------------- import ------------------------------- */}
      <Card
        title="Add recipients"
        action={
          <SmallButton
            onClick={() =>
              run("Import", async () => {
                const parsed = parseRecipientText(importText);
                if (!parsed.length) throw new Error("No email addresses found.");
                const res = await api<{ inserted: number; updated: number; skipped: number }>(
                  "/api/admin/campaigns/recipients",
                  { method: "POST", body: JSON.stringify({ action: "import", recipients: parsed }) }
                );
                setImportText("");
                await refresh();
                return `${res.inserted} added, ${res.updated} updated, ${res.skipped} skipped.`;
              })
            }
          >
            Import
          </SmallButton>
        }
      >
        <TextArea
          label="One per line"
          rows={5}
          mono
          value={importText}
          onChange={setImportText}
          hint="email, contact name, company, industry — comma, semicolon or tab separated. A header row is ignored."
        />
      </Card>

      {/* -------------------------------- send -------------------------------- */}
      <Card
        title="Send"
        action={
          <SmallButton
            onClick={() =>
              run("Audit", async () => {
                const res = await api<{ checked: number; invalid: number }>(
                  "/api/admin/campaigns/audit",
                  { method: "POST", body: JSON.stringify({ limit: 50 }) }
                );
                await refresh();
                return res.checked
                  ? `Checked ${res.checked} domains — ${res.invalid} undeliverable. Run again for more.`
                  : "All recipients have been audited.";
              })
            }
          >
            Audit domains
          </SmallButton>
        }
      >
        <p className="text-[12.5px] leading-[1.6] text-body">
          Audit first: addresses whose domain has no mail records are skipped
          automatically, which protects your sender reputation. Opted-out and
          previously bounced addresses are always skipped.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="template"
              className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body"
            >
              Template
            </label>
            <select
              id="template"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as EmailTemplateType)}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink"
            >
              {TEMPLATE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TEMPLATE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-end gap-2.5 pb-2 text-[13.5px] text-body">
            <input
              type="checkbox"
              checked={autoFollowUp}
              onChange={(e) => setAutoFollowUp(e.target.checked)}
              className="h-4 w-4"
            />
            Queue follow-ups automatically
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            disabled={busy || Boolean(active)}
            onClick={() =>
              run("Send", async () => {
                const res = await api<{ job: SendJob }>("/api/admin/campaigns/jobs", {
                  method: "POST",
                  body: JSON.stringify({
                    templateType,
                    autoFollowUp,
                    selectionMode: "all_not_sent",
                  }),
                });
                setJob(res.job);
                return `Queued ${res.job.totalCount} emails.`;
              })
            }
            className="accent-gradient min-h-[42px] rounded-pill px-6 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
          >
            Send to everyone not yet contacted
          </button>
          <button
            type="button"
            disabled={busy || Boolean(active) || selected.size === 0}
            onClick={() =>
              run("Send", async () => {
                const res = await api<{ job: SendJob }>("/api/admin/campaigns/jobs", {
                  method: "POST",
                  body: JSON.stringify({
                    templateType,
                    autoFollowUp,
                    selectionMode: "recipient_ids",
                    recipientIds: [...selected],
                  }),
                });
                setJob(res.job);
                setSelected(new Set());
                return `Queued ${res.job.totalCount} emails.`;
              })
            }
            className="min-h-[42px] rounded-pill border border-line px-6 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-body disabled:opacity-50"
          >
            Send to selected ({selected.size})
          </button>
        </div>
      </Card>

      {/* ----------------------------- recipients ----------------------------- */}
      <Card
        title={`Recipients (${rows.length})`}
        action={
          selected.size > 0 ? (
            <div className="flex gap-2">
              <SmallButton
                onClick={() =>
                  run("Opt out", async () => {
                    await api("/api/admin/campaigns/recipients", {
                      method: "POST",
                      body: JSON.stringify({ action: "opt_out", ids: [...selected] }),
                    });
                    setSelected(new Set());
                    await refresh();
                    return "Marked as opted out — they will never be emailed again.";
                  })
                }
              >
                Opt out
              </SmallButton>
              <SmallButton
                tone="danger"
                onClick={() =>
                  run("Delete", async () => {
                    await api("/api/admin/campaigns/recipients", {
                      method: "POST",
                      body: JSON.stringify({ action: "delete", ids: [...selected] }),
                    });
                    setSelected(new Set());
                    await refresh();
                    return "Deleted.";
                  })
                }
              >
                Delete
              </SmallButton>
            </div>
          ) : undefined
        }
      >
        {rows.length === 0 ? (
          <p className="text-[13px] text-body">No recipients yet — import some above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-line text-[10.5px] uppercase tracking-[0.1em] text-muted">
                  <th className="w-8 py-2">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={selected.size === rows.length && rows.length > 0}
                      onChange={(e) =>
                        setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())
                      }
                    />
                  </th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Company</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Domain</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line/60">
                    <td className="py-2">
                      <input
                        type="checkbox"
                        aria-label={`Select ${r.email}`}
                        checked={selected.has(r.id)}
                        onChange={() => toggle(r.id)}
                      />
                    </td>
                    <td className="py-2 text-ink">
                      {r.email}
                      {r.optedOut && (
                        <span className="ml-2 rounded-pill bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-700">
                          opted out
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-body">{r.companyName || "—"}</td>
                    <td className="py-2">
                      <span className={`rounded-pill px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_TONE[r.status]}`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2 text-muted">
                      {r.domainStatus === "invalid" ? (
                        <span className="text-red-600">invalid</span>
                      ) : (
                        (r.domainStatus ?? "unchecked")
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
