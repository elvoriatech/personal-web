"use client";

import { useCallback, useState } from "react";
import { EmailPreviewDialog } from "@/components/admin/EmailPreviewDialog";
import { SmallButton } from "@/components/admin/Fields";
import { ThemePicker } from "@/components/admin/ThemePicker";
import { TransportPicker } from "@/components/admin/TransportPicker";
import type { MailStatus, MailTransport } from "@/lib/mail/transports";
import { applyTemplateVars } from "@/lib/campaigns/templateVars";
import { DEFAULT_CAMPAIGN_THEME, EMAIL_THEMES, type EmailTheme } from "@/lib/campaigns/themes";
import {
  TEMPLATE_HINTS,
  TEMPLATE_LABELS,
  TEMPLATE_TYPES,
  type CampaignTemplate,
  type EmailTemplateType,
} from "@/lib/campaigns/types";
import type { Stats } from "./api";

export type SendRequest = {
  templateType: EmailTemplateType;
  theme: EmailTheme;
  transport: MailTransport | "auto";
  autoFollowUp: boolean;
  mode: "all_not_sent" | "selected";
};

const SAMPLE_VARS = { firstName: "Lena", companyName: "Nordlicht Logistik GmbH", industry: "logistics" };

export function SendComposer({
  templates,
  mail,
  stats,
  selectedCount,
  busy,
  jobActive,
  onSend,
  onAudit,
}: {
  templates: CampaignTemplate[];
  mail: MailStatus;
  stats: Stats;
  selectedCount: number;
  busy: boolean;
  jobActive: boolean;
  onSend: (req: SendRequest) => Promise<void>;
  onAudit: () => void;
}) {
  const [templateType, setTemplateType] = useState<EmailTemplateType>("initial");
  const [theme, setTheme] = useState<EmailTheme>(DEFAULT_CAMPAIGN_THEME);
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [transport, setTransport] = useState<MailTransport | null>(mail.campaignDefault);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirm, setConfirm] = useState<SendRequest["mode"] | null>(null);

  const notSent = stats.not_sent ?? 0;
  const unchecked = stats.unchecked_domain;
  const themeLabel = EMAIL_THEMES.find((t) => t.id === theme)?.label ?? theme;

  const loadPreview = useCallback(
    async (t: EmailTheme) => {
      const res = await fetch(`/api/admin/campaigns/preview?template=${templateType}&theme=${t}`);
      if (!res.ok) throw new Error(`Preview failed (${res.status})`);
      return res.text();
    },
    [templateType]
  );

  const count = confirm === "selected" ? selectedCount : notSent;

  return (
    <section className="card-surface p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[14px] font-semibold text-ink">Compose &amp; send</h2>
        <div className="flex gap-2">
          <SmallButton onClick={onAudit} disabled={busy}>
            Audit domains
          </SmallButton>
          <SmallButton onClick={() => setPreviewOpen(true)}>Preview email</SmallButton>
        </div>
      </div>

      <div className="space-y-5">
        {/* ------------------------------ template ---------------------------- */}
        <fieldset>
          <legend className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
            Which email
          </legend>
          <div className="grid gap-3 lg:grid-cols-3">
            {TEMPLATE_TYPES.map((type) => {
              const t = templates.find((x) => x.templateType === type);
              const active = templateType === type;
              return (
                <label
                  key={type}
                  className={`relative flex cursor-pointer flex-col gap-1 rounded-xl border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 ${
                    active ? "border-accent bg-bg-violet" : "border-line bg-surface hover:border-accent/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={type}
                    checked={active}
                    onChange={() => setTemplateType(type)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-[13px] font-semibold text-ink">{TEMPLATE_LABELS[type]}</span>
                    {active && <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />}
                  </span>
                  <span className="text-[11.5px] leading-[1.5] text-muted">{TEMPLATE_HINTS[type]}</span>
                  <span className="mt-1.5 truncate border-t border-line/70 pt-1.5 text-[12px] text-body" title={t?.subject}>
                    <span className="text-muted">Subject: </span>
                    {t ? applyTemplateVars(t.subject, SAMPLE_VARS) : "—"}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* -------------------------------- theme ----------------------------- */}
        <ThemePicker value={theme} onChange={setTheme} />

        {/* ------------------------------ transport --------------------------- */}
        <TransportPicker available={mail.available} value={transport} onChange={setTransport} label="Send via" />

        {/* ----------------------------- follow-ups --------------------------- */}
        <label className="flex items-start gap-3 rounded-xl border border-line bg-bg-tint/60 px-4 py-3 text-[13px] text-body">
          <input
            type="checkbox"
            checked={autoFollowUp}
            onChange={(e) => setAutoFollowUp(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
          />
          <span>
            <span className="font-semibold text-ink">Queue follow-ups automatically</span>
            <span className="mt-0.5 block text-[12px] leading-[1.55] text-muted">
              Sends the 3-day and 7-day follow-ups to anyone who hasn&apos;t replied, in the same
              theme as this send. Mark a recipient as replied and their follow-ups stop.
            </span>
          </span>
        </label>

        {/* -------------------------------- send ------------------------------ */}
        {confirm ? (
          <div
            role="alertdialog"
            aria-label="Confirm send"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-bg-violet px-4 py-3"
          >
            <p className="text-[13px] text-ink">
              Send <span className="font-semibold">{TEMPLATE_LABELS[templateType]}</span> as a{" "}
              <span className="font-semibold">{themeLabel.toLowerCase()}</span> to{" "}
              <span className="font-semibold">{count}</span> {count === 1 ? "recipient" : "recipients"}
              {confirm === "all_not_sent" ? " who haven't been contacted" : " you selected"}?
              {unchecked ? (
                <span className="block text-[12px] text-amber-800">
                  {unchecked} of your recipients have an unchecked domain — run “Audit domains” first to avoid bounces.
                </span>
              ) : null}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  const mode = confirm;
                  setConfirm(null);
                  await onSend({ templateType, theme, transport: transport ?? "auto", autoFollowUp, mode });
                }}
                className="accent-gradient min-h-[40px] rounded-pill px-5 font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
              >
                Yes, send
              </button>
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="min-h-[40px] rounded-pill border border-line bg-surface px-5 font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-body"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              disabled={busy || jobActive || notSent === 0 || !transport}
              onClick={() => setConfirm("all_not_sent")}
              className="accent-gradient min-h-[42px] rounded-pill px-6 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
            >
              Send to all not yet contacted ({notSent})
            </button>
            <button
              type="button"
              disabled={busy || jobActive || selectedCount === 0 || !transport}
              onClick={() => setConfirm("selected")}
              className="min-h-[42px] rounded-pill border border-line bg-surface px-6 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-body disabled:opacity-50"
            >
              Send to selected ({selectedCount})
            </button>
            {jobActive && (
              <p className="text-[12.5px] text-muted">A send is already running — wait for it to finish or cancel it above.</p>
            )}
          </div>
        )}
      </div>

      <EmailPreviewDialog
        open={previewOpen}
        title={TEMPLATE_LABELS[templateType]}
        theme={theme}
        onClose={() => setPreviewOpen(false)}
        load={loadPreview}
      />
    </section>
  );
}
