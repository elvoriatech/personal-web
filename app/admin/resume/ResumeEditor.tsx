"use client";

import { useActionState, useState } from "react";
import { saveResume, type SaveState } from "../actions";
import { Card, Field, SaveBar, SmallButton, TextArea } from "@/components/admin/Fields";
import type { ResumeDoc } from "@/lib/documents/types";
import { PresentationCard } from "./PresentationCard";

const emptyRole = {
  title: "",
  company: "",
  location: "",
  start: "",
  end: "",
  bullets: [] as string[],
};

export function ResumeEditor({
  initial,
  canSave,
}: {
  initial: ResumeDoc;
  canSave: boolean;
}) {
  const [doc, setDoc] = useState<ResumeDoc>(initial);
  const [state, action] = useActionState<SaveState, FormData>(saveResume, {
    status: "idle",
    message: "",
  });

  const set = <K extends keyof ResumeDoc>(key: K, value: ResumeDoc[K]) =>
    setDoc((d) => ({ ...d, [key]: value }));

  /** Arrays are edited immutably so React always sees a new reference. */
  const patchAt = <T,>(list: T[], index: number, next: T): T[] =>
    list.map((item, i) => (i === index ? next : item));

  return (
    <form action={action}>
      <input type="hidden" name="payload" value={JSON.stringify(doc)} />

      <div className="space-y-5">
        <PresentationCard
          variant={doc.preferredVariant ?? "ats"}
          photoDataUrl={doc.photoDataUrl}
          onVariant={(v) => set("preferredVariant", v)}
          onPhoto={(dataUrl) =>
            setDoc((d) => {
              // undefined means "back to the bundled portrait": drop the key
              // rather than store undefined, which JSON would silently do anyway.
              const next = { ...d };
              if (dataUrl === undefined) delete next.photoDataUrl;
              else next.photoDataUrl = dataUrl;
              return next;
            })
          }
        />

        <Card title="Header">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={doc.fullName} onChange={(v) => set("fullName", v)} />
            <Field label="Headline" value={doc.headline} onChange={(v) => set("headline", v)} />
            <Field label="Location" value={doc.location} onChange={(v) => set("location", v)} />
            <Field label="Phone" value={doc.phone} onChange={(v) => set("phone", v)} />
            <Field label="Email" value={doc.email} onChange={(v) => set("email", v)} />
            <Field label="Extras" value={doc.extras} onChange={(v) => set("extras", v)} hint="e.g. residency, language level" />
            <Field label="LinkedIn" value={doc.linkedin} onChange={(v) => set("linkedin", v)} hint="Recruiters look for this — leave blank to omit it." />
            <Field label="GitHub" value={doc.github} onChange={(v) => set("github", v)} hint="Leave blank to omit it." />
          </div>
        </Card>

        <Card title="Professional summary">
          <TextArea
            label="Summary"
            rows={6}
            value={doc.summary}
            onChange={(v) => set("summary", v)}
            hint="The highest-value place for role keywords — ATS weights it heavily."
          />
        </Card>

        <Card
          title="Skill groups"
          action={
            <SmallButton onClick={() => set("skills", [...doc.skills, { label: "", items: "" }])}>
              Add group
            </SmallButton>
          }
        >
          {doc.skills.map((group, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11.5px] text-muted">Group {i + 1}</span>
                <SmallButton tone="danger" onClick={() => set("skills", doc.skills.filter((_, j) => j !== i))}>
                  Remove
                </SmallButton>
              </div>
              <div className="space-y-3">
                <Field label="Label" value={group.label} onChange={(v) => set("skills", patchAt(doc.skills, i, { ...group, label: v }))} />
                <TextArea label="Items" rows={2} value={group.items} onChange={(v) => set("skills", patchAt(doc.skills, i, { ...group, items: v }))} />
              </div>
            </div>
          ))}
        </Card>

        <Card
          title="Experience"
          action={
            <SmallButton onClick={() => set("roles", [...doc.roles, { ...emptyRole }])}>
              Add role
            </SmallButton>
          }
        >
          {doc.roles.map((role, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11.5px] text-muted">Role {i + 1}</span>
                <SmallButton tone="danger" onClick={() => set("roles", doc.roles.filter((_, j) => j !== i))}>
                  Remove
                </SmallButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title" value={role.title} onChange={(v) => set("roles", patchAt(doc.roles, i, { ...role, title: v }))} />
                <Field label="Company" value={role.company} onChange={(v) => set("roles", patchAt(doc.roles, i, { ...role, company: v }))} />
                <Field label="Location" value={role.location} onChange={(v) => set("roles", patchAt(doc.roles, i, { ...role, location: v }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start" value={role.start} onChange={(v) => set("roles", patchAt(doc.roles, i, { ...role, start: v }))} />
                  <Field label="End" value={role.end} onChange={(v) => set("roles", patchAt(doc.roles, i, { ...role, end: v }))} />
                </div>
              </div>
              <div className="mt-3">
                <TextArea
                  label="Bullets"
                  rows={5}
                  value={role.bullets.join("\n")}
                  onChange={(v) =>
                    set("roles", patchAt(doc.roles, i, {
                      ...role,
                      bullets: v.split("\n").map((b) => b.trim()).filter(Boolean),
                    }))
                  }
                  hint="One achievement per line. Start with a verb; include the technology by name."
                />
              </div>
            </div>
          ))}
        </Card>

        <Card
          title="Education and certifications"
          action={
            <SmallButton onClick={() => set("education", [...doc.education, { qualification: "", institution: "", period: "" }])}>
              Add entry
            </SmallButton>
          }
        >
          {doc.education.map((item, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11.5px] text-muted">Entry {i + 1}</span>
                <SmallButton tone="danger" onClick={() => set("education", doc.education.filter((_, j) => j !== i))}>
                  Remove
                </SmallButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Qualification" value={item.qualification} onChange={(v) => set("education", patchAt(doc.education, i, { ...item, qualification: v }))} />
                <Field label="Institution" value={item.institution} onChange={(v) => set("education", patchAt(doc.education, i, { ...item, institution: v }))} />
                <Field label="Period" value={item.period} onChange={(v) => set("education", patchAt(doc.education, i, { ...item, period: v }))} />
              </div>
              <div className="mt-3">
                <TextArea label="Detail (optional)" rows={2} value={item.detail ?? ""} onChange={(v) => set("education", patchAt(doc.education, i, { ...item, detail: v || undefined }))} />
              </div>
            </div>
          ))}
        </Card>

        <Card
          title="AI engineering projects"
          action={
            <SmallButton onClick={() => set("aiProjects", [...doc.aiProjects, { name: "", role: "", bullets: [] }])}>
              Add AI project
            </SmallButton>
          }
        >
          <p className="text-[12px] text-muted">
            This is where AI experience is proved rather than asserted. Only
            describe systems you have actually built.
          </p>
          {doc.aiProjects.map((project, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11.5px] text-muted">AI project {i + 1}</span>
                <SmallButton tone="danger" onClick={() => set("aiProjects", doc.aiProjects.filter((_, j) => j !== i))}>
                  Remove
                </SmallButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" value={project.name} onChange={(v) => set("aiProjects", patchAt(doc.aiProjects, i, { ...project, name: v }))} />
                <Field label="Your role" value={project.role} onChange={(v) => set("aiProjects", patchAt(doc.aiProjects, i, { ...project, role: v }))} />
              </div>
              <div className="mt-3">
                <TextArea
                  label="Bullets"
                  rows={5}
                  value={project.bullets.join("\n")}
                  onChange={(v) =>
                    set("aiProjects", patchAt(doc.aiProjects, i, {
                      ...project,
                      bullets: v.split("\n").map((b) => b.trim()).filter(Boolean),
                    }))
                  }
                  hint="One per line. Name the model, framework and what it actually does."
                />
              </div>
            </div>
          ))}
        </Card>

        <Card
          title="Selected projects"
          action={
            <SmallButton onClick={() => set("projects", [...doc.projects, { name: "", url: "", summary: "" }])}>
              Add project
            </SmallButton>
          }
        >
          {doc.projects.map((project, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11.5px] text-muted">Project {i + 1}</span>
                <SmallButton tone="danger" onClick={() => set("projects", doc.projects.filter((_, j) => j !== i))}>
                  Remove
                </SmallButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" value={project.name} onChange={(v) => set("projects", patchAt(doc.projects, i, { ...project, name: v }))} />
                <Field label="URL" value={project.url} onChange={(v) => set("projects", patchAt(doc.projects, i, { ...project, url: v }))} />
              </div>
              <div className="mt-3">
                <TextArea label="Summary" rows={2} value={project.summary} onChange={(v) => set("projects", patchAt(doc.projects, i, { ...project, summary: v }))} />
              </div>
            </div>
          ))}
        </Card>

        <Card
          title="Certifications"
          action={
            <SmallButton onClick={() => set("certifications", [...doc.certifications, { qualification: "", institution: "", period: "" }])}>
              Add certification
            </SmallButton>
          }
        >
          {doc.certifications.map((item, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11.5px] text-muted">Certification {i + 1}</span>
                <SmallButton tone="danger" onClick={() => set("certifications", doc.certifications.filter((_, j) => j !== i))}>
                  Remove
                </SmallButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Name" value={item.qualification} onChange={(v) => set("certifications", patchAt(doc.certifications, i, { ...item, qualification: v }))} />
                <Field label="Issuer" value={item.institution} onChange={(v) => set("certifications", patchAt(doc.certifications, i, { ...item, institution: v }))} />
                <Field label="Year" value={item.period} onChange={(v) => set("certifications", patchAt(doc.certifications, i, { ...item, period: v }))} />
              </div>
              <div className="mt-3">
                <TextArea label="Detail (optional)" rows={2} value={item.detail ?? ""} onChange={(v) => set("certifications", patchAt(doc.certifications, i, { ...item, detail: v || undefined }))} />
              </div>
            </div>
          ))}
        </Card>

        <Card title="Languages">
          <Field label="Languages" value={doc.languages} onChange={(v) => set("languages", v)} />
        </Card>
      </div>

      <SaveBar state={state} canSave={canSave} />
    </form>
  );
}
