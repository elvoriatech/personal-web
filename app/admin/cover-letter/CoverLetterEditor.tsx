"use client";

import { useActionState, useState } from "react";
import { saveCoverLetter, type SaveState } from "../actions";
import { Card, Field, SaveBar, SmallButton, TextArea } from "@/components/admin/Fields";
import type { CoverLetterDoc } from "@/lib/documents/types";

export function CoverLetterEditor({
  initial,
  canSave,
}: {
  initial: CoverLetterDoc;
  canSave: boolean;
}) {
  const [doc, setDoc] = useState<CoverLetterDoc>(initial);
  const [state, action] = useActionState<SaveState, FormData>(saveCoverLetter, {
    status: "idle",
    message: "",
  });

  const set = <K extends keyof CoverLetterDoc>(k: K, v: CoverLetterDoc[K]) =>
    setDoc((d) => ({ ...d, [k]: v }));

  return (
    <form action={action}>
      <input type="hidden" name="payload" value={JSON.stringify(doc)} />

      <div className="space-y-5">
        <Card title="This application">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Target role"
              value={doc.targetRole}
              onChange={(v) => set("targetRole", v)}
              hint="Replaces {{role}} in the text below."
            />
            <Field
              label="Target company"
              value={doc.targetCompany}
              onChange={(v) => set("targetCompany", v)}
              hint="Replaces {{company}}."
            />
          </div>
          <Field label="Greeting" value={doc.greeting} onChange={(v) => set("greeting", v)} />
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

      <SaveBar state={state} canSave={canSave} />
    </form>
  );
}
