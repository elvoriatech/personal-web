"use client";

import { useCallback, useEffect, useState } from "react";
import { EmailPreviewDialog } from "@/components/admin/EmailPreviewDialog";
import { Card, Field, SmallButton, TextArea } from "@/components/admin/Fields";
import { DEFAULT_CAMPAIGN_THEME } from "@/lib/campaigns/themes";
import {
  TEMPLATE_HINTS,
  TEMPLATE_LABELS,
  type CampaignTemplate,
  type EmailTemplateType,
} from "@/lib/campaigns/types";

type Copy = { subject: string; bodyHtml: string };
type Defaults = Record<EmailTemplateType, Copy>;

export function CampaignTemplateEditor({ configured }: { configured: boolean }) {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  /** Last saved copy per template, for the "unsaved changes" indicator. */
  const [saved, setSaved] = useState<Partial<Record<EmailTemplateType, Copy>>>({});
  const [defaults, setDefaults] = useState<Defaults | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<CampaignTemplate | null>(null);

  useEffect(() => {
    if (!configured) return;
    void (async () => {
      try {
        const res = await fetch("/api/admin/campaigns/templates");
        const data = (await res.json()) as {
          templates?: CampaignTemplate[];
          defaults?: Defaults;
          error?: string;
        };
        if (data.error) throw new Error(data.error);
        const list = data.templates ?? [];
        setTemplates(list);
        setSaved(Object.fromEntries(list.map((t) => [t.templateType, { subject: t.subject, bodyHtml: t.bodyHtml }])));
        setDefaults(data.defaults ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load templates.");
      }
    })();
  }, [configured]);

  const patch = (i: number, next: CampaignTemplate) =>
    setTemplates((list) => list.map((t, j) => (j === i ? next : t)));

  const isDirty = (t: CampaignTemplate) => {
    const s = saved[t.templateType];
    return !s || s.subject !== t.subject || s.bodyHtml !== t.bodyHtml;
  };
  const isDefault = (t: CampaignTemplate) => {
    const d = defaults?.[t.templateType];
    return Boolean(d && d.subject === t.subject && d.bodyHtml === t.bodyHtml);
  };

  async function save(t: CampaignTemplate) {
    setStatus("");
    setError("");
    try {
      const res = await fetch("/api/admin/campaigns/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
      const data = (await res.json()) as { error?: string };
      if (data.error) throw new Error(data.error);
      setSaved((s) => ({ ...s, [t.templateType]: { subject: t.subject, bodyHtml: t.bodyHtml } }));
      setStatus(`Saved ${TEMPLATE_LABELS[t.templateType]}. Future sends use the new copy.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  function restore(i: number, t: CampaignTemplate) {
    const d = defaults?.[t.templateType];
    if (!d) return;
    patch(i, { ...t, ...d });
    setStatus(`Restored the default ${TEMPLATE_LABELS[t.templateType].toLowerCase()} copy — save to keep it.`);
  }

  // Previews the editor's current, possibly unsaved, content.
  const loadPreview = useCallback(
    async (theme: string) => {
      if (!preview) return "";
      const res = await fetch("/api/admin/campaigns/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: preview.subject, bodyHtml: preview.bodyHtml, theme }),
      });
      if (!res.ok) throw new Error(`Preview failed (${res.status})`);
      return res.text();
    },
    [preview]
  );

  if (!configured) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
        Templates are stored in Postgres. Set <code>DATABASE_URL</code> and apply{" "}
        <code>lib/db/schema.sql</code>.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {(status || error) && (
        <p
          role="status"
          className={`rounded-xl px-4 py-2.5 text-[13px] ${
            error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {error || status}
        </p>
      )}

      <p className="max-w-[72ch] text-[13px] leading-[1.6] text-body">
        Write in plain text — it is escaped and laid out in the theme you choose at send time,
        so a template can never break the email. A blank line starts a paragraph; lines beginning
        with <code className="rounded bg-bg-tint px-1">- </code> become a list. Placeholders:{" "}
        <code className="rounded bg-bg-tint px-1">{"{{firstName}}"}</code>{" "}
        <code className="rounded bg-bg-tint px-1">{"{{company}}"}</code>{" "}
        <code className="rounded bg-bg-tint px-1">{"{{industry}}"}</code>. End with your name only —
        the signature block and the legally required opt-out line are added automatically.
      </p>

      {templates.map((t, i) => {
        const dirty = isDirty(t);
        return (
          <Card
            key={t.templateType}
            title={TEMPLATE_LABELS[t.templateType]}
            action={
              <div className="flex flex-wrap items-center gap-2">
                {dirty && (
                  <span className="rounded-pill bg-amber-50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-amber-800">
                    Unsaved
                  </span>
                )}
                <SmallButton onClick={() => setPreview(t)}>Preview</SmallButton>
                <SmallButton onClick={() => restore(i, t)} disabled={!defaults || isDefault(t)}>
                  Restore default
                </SmallButton>
                <SmallButton onClick={() => save(t)} disabled={!dirty} tone="primary">
                  Save
                </SmallButton>
              </div>
            }
          >
            <p className="-mt-2 text-[12px] text-muted">{TEMPLATE_HINTS[t.templateType]}</p>
            <Field label="Subject" value={t.subject} onChange={(v) => patch(i, { ...t, subject: v })} />
            <TextArea
              label="Body"
              rows={16}
              mono
              value={t.bodyHtml}
              onChange={(v) => patch(i, { ...t, bodyHtml: v })}
            />
          </Card>
        );
      })}

      <EmailPreviewDialog
        open={preview !== null}
        title={preview ? `${TEMPLATE_LABELS[preview.templateType]}${isDirty(preview) ? " (unsaved edits)" : ""}` : ""}
        theme={DEFAULT_CAMPAIGN_THEME}
        onClose={() => setPreview(null)}
        load={loadPreview}
      />
    </div>
  );
}
