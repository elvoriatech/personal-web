"use client";

import { useActionState, useCallback, useState } from "react";
import { saveTemplates, type SaveState } from "../actions";
import { EmailPreviewDialog } from "@/components/admin/EmailPreviewDialog";
import { Card, Field, SaveBar, SmallButton, TextArea } from "@/components/admin/Fields";
import { site } from "@/content/site";
import { DEFAULT_EMAIL_THEME } from "@/lib/campaigns/themes";
import type { EmailTemplate } from "@/lib/documents/types";

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `template-${Date.now()}`;

/** Realistic stand-ins so a preview reads like a real email, not a form. */
const SAMPLE_VARS: Record<string, string> = {
  firstName: "Lena",
  company: "Nordlicht Logistik GmbH",
  industry: "logistics",
  observation: "the booking form does not work on a phone",
  role: "Senior Software Engineer",
  senderName: site.name,
  portfolioUrl: site.url,
  phone: site.phone,
  calendarUrl: `${site.url}/#contact`,
  deadline: "Friday",
};

export function TemplateEditor({
  initial,
  canSave,
}: {
  initial: EmailTemplate[];
  canSave: boolean;
}) {
  const [items, setItems] = useState<EmailTemplate[]>(initial);
  const [copied, setCopied] = useState<string | null>(null);
  const [preview, setPreview] = useState<EmailTemplate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const active = items.filter((t) => !t.archivedAt);
  const archived = items.filter((t) => t.archivedAt);
  const update = (id: string, next: Partial<EmailTemplate>) =>
    setItems((list) => list.map((t) => (t.id === id ? { ...t, ...next } : t)));
  const archive = (id: string) => update(id, { archivedAt: new Date().toISOString().slice(0, 10) });
  const restore = (id: string) => update(id, { archivedAt: undefined });
  const destroy = (id: string) => {
    setItems((list) => list.filter((t) => t.id !== id));
    setConfirmDelete(null);
  };
  const [state, action] = useActionState<SaveState, FormData>(saveTemplates, {
    status: "idle",
    message: "",
  });

  const patch = (i: number, next: EmailTemplate) =>
    setItems((list) => list.map((t, j) => (j === i ? next : t)));

  async function copy(t: EmailTemplate) {
    try {
      await navigator.clipboard.writeText(`Subject: ${t.subject}\n\n${t.body}`);
      setCopied(t.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  // Renders the template being previewed — unsaved edits included — with the
  // sample values filled in, through the same layout the campaign mailer uses.
  const loadPreview = useCallback(
    async (theme: string) => {
      if (!preview) return "";
      const res = await fetch("/api/admin/campaigns/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: preview.subject,
          bodyHtml: preview.body,
          theme,
          showOptOut: false,
          vars: SAMPLE_VARS,
        }),
      });
      if (!res.ok) throw new Error(`Preview failed (${res.status})`);
      return res.text();
    },
    [preview]
  );

  return (
    <form action={action}>
      <input type="hidden" name="payload" value={JSON.stringify(items)} />

      <div className="mb-5 flex justify-end">
        <SmallButton
          onClick={() =>
            setItems([
              ...items,
              { id: slug(`template ${items.length + 1}`), name: "", purpose: "", subject: "", body: "" },
            ])
          }
        >
          Add template
        </SmallButton>
      </div>

      <div className="space-y-5">
        {active.map((t) => {
          const i = items.indexOf(t);
          return (
          <Card
            key={t.id}
            title={t.name || `Template ${i + 1}`}
            action={
              <div className="flex flex-wrap gap-2">
                <SmallButton onClick={() => setPreview(t)} tone="primary">
                  Preview
                </SmallButton>
                <SmallButton onClick={() => copy(t)}>
                  {copied === t.id ? "Copied" : "Copy"}
                </SmallButton>
                <SmallButton onClick={() => archive(t.id)}>Archive</SmallButton>
              </div>
            }
          >
            {t.purpose && <p className="-mt-2 text-[12px] text-muted">{t.purpose}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={t.name} onChange={(v) => patch(i, { ...t, name: v, id: t.id || slug(v) })} />
              <Field label="Purpose" value={t.purpose} onChange={(v) => patch(i, { ...t, purpose: v })} />
            </div>
            <Field label="Subject" value={t.subject} onChange={(v) => patch(i, { ...t, subject: v })} />
            <TextArea
              label="Body"
              rows={14}
              mono
              value={t.body}
              onChange={(v) => patch(i, { ...t, body: v })}
              hint="Placeholders: {{firstName}} {{company}} {{observation}} {{role}} {{senderName}} {{portfolioUrl}} {{phone}} {{calendarUrl}} {{deadline}} — the preview fills them with sample values."
            />
          </Card>
          );
        })}

        {archived.length > 0 && (
          <section className="rounded-card border border-dashed border-line bg-bg-tint/50 p-5">
            <h2 className="font-display text-[13px] font-semibold text-ink">
              Archived <span className="ml-1 text-muted">({archived.length})</span>
            </h2>
            <p className="mt-1 text-[12px] text-muted">
              Kept out of the working list but still saved. Restore any time, or delete for good —
              deletion cannot be undone once you save.
            </p>
            <ul className="mt-3 space-y-2">
              {archived.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-[13px] font-semibold text-ink">{t.name || t.id}</p>
                    <p className="truncate text-[11.5px] text-muted">
                      {t.purpose || t.subject} · archived {t.archivedAt}
                    </p>
                  </div>
                  {confirmDelete === t.id ? (
                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-red-800">
                      Delete “{t.name || t.id}” permanently?
                      <button
                        type="button"
                        onClick={() => destroy(t.id)}
                        className="min-h-[32px] rounded-pill bg-red-600 px-3.5 text-[11.5px] font-semibold text-white"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="min-h-[32px] rounded-pill border border-line bg-surface px-3.5 text-[11.5px] font-semibold text-body"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <SmallButton onClick={() => restore(t.id)}>Restore</SmallButton>
                      <SmallButton tone="danger" onClick={() => setConfirmDelete(t.id)}>
                        Delete permanently
                      </SmallButton>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <SaveBar state={state} canSave={canSave} />

      <EmailPreviewDialog
        open={preview !== null}
        title={preview ? preview.name || "Outreach template" : ""}
        theme={DEFAULT_EMAIL_THEME}
        onClose={() => setPreview(null)}
        load={loadPreview}
      />
    </form>
  );
}
