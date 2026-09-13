"use client";

import { useEffect, useState } from "react";
import { Card, Field, SmallButton, TextArea } from "@/components/admin/Fields";
import { TEMPLATE_LABELS, type CampaignTemplate } from "@/lib/campaigns/types";

export function CampaignTemplateEditor({ configured }: { configured: boolean }) {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured) return;
    void (async () => {
      try {
        const res = await fetch("/api/admin/campaigns/templates");
        const data = (await res.json()) as { templates?: CampaignTemplate[]; error?: string };
        if (data.error) throw new Error(data.error);
        setTemplates(data.templates ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load templates.");
      }
    })();
  }, [configured]);

  const patch = (i: number, next: CampaignTemplate) =>
    setTemplates((list) => list.map((t, j) => (j === i ? next : t)));

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
      setStatus(`Saved ${TEMPLATE_LABELS[t.templateType]}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

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

      {templates.map((t, i) => (
        <Card
          key={t.templateType}
          title={TEMPLATE_LABELS[t.templateType]}
          action={<SmallButton onClick={() => save(t)}>Save</SmallButton>}
        >
          <Field
            label="Subject"
            value={t.subject}
            onChange={(v) => patch(i, { ...t, subject: v })}
          />
          <TextArea
            label="Body"
            rows={14}
            mono
            value={t.bodyHtml}
            onChange={(v) => patch(i, { ...t, bodyHtml: v })}
            hint="Plain text — it is escaped and converted to HTML on send. Placeholders: {{firstName}} {{company}} {{industry}}. An opt-out line is appended automatically."
          />
        </Card>
      ))}
    </div>
  );
}
