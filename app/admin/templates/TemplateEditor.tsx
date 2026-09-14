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
        {items.map((t, i) => (
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
                <SmallButton
                  tone="danger"
                  onClick={() => setItems(items.filter((_, j) => j !== i))}
                >
                  Remove
                </SmallButton>
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
        ))}
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
