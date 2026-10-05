"use client";

import { useActionState, useCallback, useState } from "react";
import { saveTemplates, type SaveState } from "../actions";
import type { PickableCompany } from "@/components/admin/CompanyPicker";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmailPreviewDialog, type PreviewSend } from "@/components/admin/EmailPreviewDialog";
import { Card, Field, SaveBar, SmallButton, TextArea } from "@/components/admin/Fields";
import { TransportPicker } from "@/components/admin/TransportPicker";
import { site } from "@/content/site";
import { companyVars, extraPlaceholders, senderVars, EXTRA_PLACEHOLDER_HINTS } from "@/lib/campaigns/outreachVars";
import { DEFAULT_EMAIL_THEME, type EmailTheme } from "@/lib/campaigns/themes";
import { fillPlaceholders, type EmailTemplate } from "@/lib/documents/types";
import type { MailStatus, MailTransport } from "@/lib/mail/transports";
import { SendToCompany, type SendTarget } from "./SendToCompany";

const NO_TARGET: SendTarget = { recipientId: null, extras: {} };
const sentKey = (recipientId: string, templateId: string) => `${recipientId}:${templateId}`;

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
  companies,
  initialSends,
  mail,
}: {
  initial: EmailTemplate[];
  canSave: boolean;
  companies: PickableCompany[];
  /** "recipientId:templateId" → when that template last went to that company. */
  initialSends: Record<string, string>;
  mail: MailStatus;
}) {
  const [items, setItems] = useState<EmailTemplate[]>(initial);
  const [copied, setCopied] = useState<string | null>(null);
  // `recipientId` null: the sample preview. Set: the real email for that company.
  const [preview, setPreview] = useState<(EmailTemplate & { target: SendTarget }) | null>(null);
  const [targets, setTargets] = useState<Record<string, SendTarget>>({});
  const [sends, setSends] = useState<Record<string, string>>(initialSends);
  const [transport, setTransport] = useState<MailTransport | null>(mail.campaignDefault);
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
      if (preview.target.recipientId) {
        const res = await fetch("/api/admin/outreach/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: preview.subject,
            body: preview.body,
            recipientId: preview.target.recipientId,
            extras: preview.target.extras,
            theme,
          }),
        });
        if (!res.ok) throw new Error((await res.text()) || `Preview failed (${res.status})`);
        return res.text();
      }
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

  const previewCompany = preview?.target.recipientId
    ? (companies.find((c) => c.id === preview.target.recipientId) ?? null)
    : null;

  // The send bar for a company preview. The subject is filled here with the
  // same values the server uses, so the header matches what arrives.
  const previewSend: PreviewSend | undefined =
    preview && previewCompany
      ? (() => {
          const vars = { ...preview.target.extras, ...companyVars(previewCompany), ...senderVars() };
          const missing = extraPlaceholders(preview.subject, preview.body).filter(
            (k) => !preview.target.extras[k]?.trim()
          );
          const blockedReason = previewCompany.blocked
            ? previewCompany.blocked
            : !transport
              ? "No sending account is set up — connect Hotmail under Send an email, or set RESEND_API_KEY."
              : missing.length
                ? `Fill in ${missing.map((m) => EXTRA_PLACEHOLDER_HINTS[m]?.label.toLowerCase() ?? `{{${m}}}`).join(", ")} on the template card first — it shows as a highlighted [${missing[0]}] above.`
                : "";
          const contact = previewCompany.contactName.trim();
          return {
            to: contact ? `${contact} <${previewCompany.email}>` : previewCompany.email,
            subject: fillPlaceholders(preview.subject, vars).trim(),
            blockedReason,
            onSend: async (theme: EmailTheme) => {
              const res = await fetch("/api/admin/outreach/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  templateId: preview.id,
                  subject: preview.subject,
                  body: preview.body,
                  recipientId: previewCompany.id,
                  extras: preview.target.extras,
                  theme,
                  via: transport ?? "auto",
                }),
              });
              const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; sentAt?: string };
              if (!res.ok || !data.ok) return { ok: false as const, error: data.error ?? `Sending failed (${res.status})` };
              setSends((m) => ({ ...m, [sentKey(previewCompany.id, preview.id)]: data.sentAt ?? new Date().toISOString() }));
              return { ok: true as const };
            },
          };
        })()
      : undefined;

  return (
    <form action={action}>
      <input type="hidden" name="payload" value={JSON.stringify(items)} />

      {companies.length > 0 && mail.available.length > 1 && (
        <div className="mb-5 rounded-card border border-line bg-surface p-5">
          <TransportPicker
            label="Send outreach from"
            available={mail.available}
            value={transport}
            onChange={setTransport}
          />
        </div>
      )}

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
                <SmallButton onClick={() => setPreview({ ...t, target: NO_TARGET })}>
                  Sample preview
                </SmallButton>
                <SmallButton onClick={() => copy(t)}>
                  {copied === t.id ? "Copied" : "Copy"}
                </SmallButton>
                <SmallButton onClick={() => archive(t.id)}>Archive</SmallButton>
              </div>
            }
          >
            {t.purpose && <p className="-mt-2 text-[12px] text-muted">{t.purpose}</p>}
            {(() => {
              const target = targets[t.id] ?? NO_TARGET;
              return (
                <SendToCompany
                  companies={companies}
                  target={target}
                  onChange={(next) => setTargets((m) => ({ ...m, [t.id]: next }))}
                  extras={extraPlaceholders(t.subject, t.body)}
                  lastSentAt={target.recipientId ? (sends[sentKey(target.recipientId, t.id)] ?? null) : null}
                  onPreview={() => setPreview({ ...t, target })}
                />
              );
            })()}
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
              hint="From the company: {{firstName}} {{contactName}} {{company}} {{website}} {{industry}}. From you: {{senderName}} {{portfolioUrl}} {{phone}} {{calendarUrl}}. Anything else, like {{observation}}, {{role}} or {{deadline}}, is asked for when you pick a company."
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
                  <div className="flex gap-2">
                    <SmallButton onClick={() => restore(t.id)}>Restore</SmallButton>
                    <SmallButton tone="danger" onClick={() => setConfirmDelete(t.id)}>
                      Delete permanently
                    </SmallButton>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <SaveBar state={state} canSave={canSave} />

      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Delete “${items.find((t) => t.id === confirmDelete)?.name || confirmDelete}”?`}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && destroy(confirmDelete)}
      >
        The template is removed from this list. Click <strong>Save changes</strong> afterwards to
        delete it for good — until then, reloading the page brings it back.
      </ConfirmDialog>

      <EmailPreviewDialog
        open={preview !== null}
        title={
          preview
            ? previewCompany
              ? `${preview.name || "Outreach template"} → ${previewCompany.companyName || previewCompany.email}`
              : preview.name || "Outreach template"
            : ""
        }
        theme={DEFAULT_EMAIL_THEME}
        send={previewSend}
        onClose={() => setPreview(null)}
        load={loadPreview}
      />
    </form>
  );
}
