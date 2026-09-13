"use client";

import { SmallButton } from "@/components/admin/Fields";
import { EMAIL_THEMES } from "@/lib/campaigns/themes";
import { TEMPLATE_LABELS, type SendJob } from "@/lib/campaigns/types";

const STATUS_COPY: Record<SendJob["status"], string> = {
  queued: "Queued — starting shortly",
  running: "Sending",
  completed: "Completed",
  failed: "Stopped with an error",
  cancelled: "Cancelled",
};

export function JobProgress({
  job,
  onCancel,
  busy,
}: {
  job: SendJob;
  onCancel: () => void;
  busy: boolean;
}) {
  const active = job.status === "queued" || job.status === "running";
  const pct = job.totalCount ? Math.round((job.processedIndex / job.totalCount) * 100) : 0;
  const themeLabel = EMAIL_THEMES.find((t) => t.id === job.theme)?.label ?? job.theme;

  return (
    <section
      aria-live="polite"
      className={`rounded-card border p-4 ${
        active ? "border-accent/40 bg-bg-violet" : "border-line bg-surface"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-[13.5px] font-semibold text-ink">
            {TEMPLATE_LABELS[job.templateType]}
            <span className="ml-2 rounded-pill border border-line bg-surface px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-body">
              {themeLabel}
            </span>
          </p>
          <p className="mt-0.5 text-[12.5px] text-body">
            {STATUS_COPY[job.status]}
            {active && ` · ${job.processedIndex} of ${job.totalCount}`}
          </p>
        </div>
        {active && (
          <SmallButton tone="danger" onClick={onCancel} disabled={busy}>
            Cancel
          </SmallButton>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line"
      >
        <div
          className="accent-gradient h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[12px] text-body">
        <span className="font-semibold text-ink">{job.sentCount}</span> sent ·{" "}
        <span className={job.failedCount ? "font-semibold text-red-700" : ""}>{job.failedCount}</span>{" "}
        failed
        {job.lastError && <span className="text-muted"> · {job.lastError}</span>}
      </p>
    </section>
  );
}
