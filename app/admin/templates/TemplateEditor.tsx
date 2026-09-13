"use client";

import { useActionState, useState } from "react";
import { saveTemplates, type SaveState } from "../actions";
import { Card, Field, SaveBar, SmallButton, TextArea } from "@/components/admin/Fields";
import type { EmailTemplate } from "@/lib/documents/types";

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `template-${Date.now()}`;

export function TemplateEditor({
  initial,
  canSave,
}: {
  initial: EmailTemplate[];
  canSave: boolean;
}) {
  const [items, setItems] = useState<EmailTemplate[]>(initial);
  const [copied, setCopied] = useState<string | null>(null);
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
              <div className="flex gap-2">
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
              hint="Placeholders: {{firstName}} {{company}} {{observation}} {{role}} {{senderName}} {{portfolioUrl}} {{phone}} {{calendarUrl}} {{deadline}}"
            />
          </Card>
        ))}
      </div>

      <SaveBar state={state} canSave={canSave} />
    </form>
  );
}
