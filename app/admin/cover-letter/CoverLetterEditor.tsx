"use client";

import { useActionState, useState } from "react";
import { saveCoverLetter, type SaveState } from "../actions";
import { Card, Field, SaveBar, SmallButton, TextArea } from "@/components/admin/Fields";
import type { CoverLetterDoc } from "@/lib/documents/types";
import { CoverLetterPreviewDialog } from "./CoverLetterPreviewDialog";

export function CoverLetterEditor({
  initial,
  canSave,
}: {
  initial: CoverLetterDoc;
  canSave: boolean;
}) {
  const [doc, setDoc] = useState<CoverLetterDoc>(initial);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [state, action] = useActionState<SaveState, FormData>(saveCoverLetter, {
    status: "idle",
    message: "",
  });
  const dirty = JSON.stringify(doc) !== JSON.stringify(initial);

  const set = <K extends keyof CoverLetterDoc>(k: K, v: CoverLetterDoc[K]) =>
    setDoc((d) => ({ ...d, [k]: v }));

  const previewButton = (label: string, primary = false) => (
    <button
      type="button"
      onClick={() => setPreviewOpen(true)}
      className={
        primary
          ? "inline-flex min-h-[36px] items-center gap-1.5 rounded-pill border border-accent bg-accent px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-accent-deep"
          : "min-h-[44px] rounded-pill border border-line bg-surface px-6 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
      }
    >
      {primary && (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8Z" />
          <circle cx="8" cy="8" r="2" />
        </svg>
      )}
      {label}
    </button>
  );

  return (
    <form action={action}>
      <input type="hidden" name="payload" value={JSON.stringify(doc)} />

      <div className="space-y-5">
        <Card title="This application" action={previewButton("Preview & download", true)}>
          <p className="-mt-2 text-[12.5px] leading-[1.6] text-body">
            Enter the post and company, preview the letter with them filled in, and download it.
            You only need to save if you want these kept as the defaults.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Post / role"
              value={doc.targetRole}
              onChange={(v) => set("targetRole", v)}
              hint="Replaces {{role}}. Leave blank for “the advertised position”."
            />
            <Field
              label="Company"
              value={doc.targetCompany}
              onChange={(v) => set("targetCompany", v)}
              hint="Replaces {{company}}. Also used in the download's file name."
            />
          </div>
          <Field label="Greeting" value={doc.greeting} onChange={(v) => set("greeting", v)} hint="e.g. Dear Hiring Manager, — or address a named person." />
        </Card>

        <Card title="Header">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={doc.fullName} onChange={(v) => set("fullName", v)} />
            <Field label="Headline" value={doc.headline} onChange={(v) => set("headline", v)} />
            <Field label="Location" value={doc.location} onChange={(v) => set("location", v)} />
            <Field label="Phone" value={doc.phone} onChange={(v) => set("phone", v)} />
            <Field label="Email" value={doc.email} onChange={(v) => set("email", v)} />
          </div>
        </Card>

        <Card
          title="Body"
          action={
            <SmallButton onClick={() => set("paragraphs", [...doc.paragraphs, ""])}>
              Add paragraph
            </SmallButton>
          }
        >
          <p className="-mt-2 text-[12px] text-muted">
            Use <code className="rounded bg-bg-tint px-1">{"{{role}}"}</code> and{" "}
            <code className="rounded bg-bg-tint px-1">{"{{company}}"}</code> anywhere; they are filled from the fields above.
          </p>
          {doc.paragraphs.map((para, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11.5px] text-muted">Paragraph {i + 1}</span>
                <SmallButton
                  tone="danger"
                  onClick={() => set("paragraphs", doc.paragraphs.filter((_, j) => j !== i))}
                >
                  Remove
                </SmallButton>
              </div>
              <TextArea
                label=""
                rows={5}
                value={para}
                onChange={(v) =>
                  set("paragraphs", doc.paragraphs.map((x, j) => (j === i ? v : x)))
                }
              />
            </div>
          ))}
        </Card>

        <Card title="Closing">
          <TextArea label="Closing" rows={3} value={doc.closing} onChange={(v) => set("closing", v)} />
        </Card>
      </div>

      <SaveBar state={state} canSave={canSave} extra={previewButton("Preview")} />

      <CoverLetterPreviewDialog
        open={previewOpen}
        letter={doc}
        dirty={dirty}
        onClose={() => setPreviewOpen(false)}
      />
    </form>
  );
}
