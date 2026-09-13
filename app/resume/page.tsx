import type { Metadata } from "next";
import { DocHeading, DocumentChrome } from "@/components/documents/DocumentChrome";
import { getDocuments } from "@/lib/documents/store";

export const metadata: Metadata = {
  title: "Résumé",
  description:
    "ATS-friendly résumé for Zahoor Ahmed — Senior Software Engineer and AI Engineer.",
  robots: { index: false, follow: true },
};

export default async function ResumePage() {
  const { resume } = await getDocuments();
  const contact = [
    resume.location,
    resume.phone,
    resume.email,
    resume.linkedin,
    resume.github,
    resume.extras,
  ]
    .filter(Boolean)
    .join("  |  ");

  const ats = {
    href: "/api/documents/resume",
    label: "Single column (ATS)",
    hint: "Upload this one to job portals — no tables, no images, parses cleanly.",
  };
  const design = {
    href: "/api/documents/resume?variant=design",
    label: resume.photoDataUrl === "" ? "Two column" : "Two column (with photo)",
    hint: "For emailing a human. Has a sidebar, so do not upload it to an ATS.",
  };
  // The template chosen in the admin leads; the other stays one click away.
  const downloads = resume.preferredVariant === "design" ? [design, ats] : [ats, design];

  return (
    <DocumentChrome title="Résumé" downloads={downloads}>
      <p className="mb-6 rounded-xl border border-line bg-bg-violet px-4 py-3 text-[12.5px] leading-[1.6] text-body print:hidden">
        <strong className="text-ink">Two builds, one source.</strong> The preview
        below is the single-column version — upload that to job portals, where
        tables and photos get mangled. The two-column build adds your photo and a
        sidebar for when a person reads it directly.
      </p>

      <div className="font-sans text-[13px] leading-[1.55] text-black">
        <header>
          <p className="font-display text-[26px] font-bold leading-tight tracking-tight text-black">
            {resume.fullName}
          </p>
          <p className="mt-1 text-[14px]">{resume.headline}</p>
          <p className="mt-1.5 text-[12px] text-neutral-700">{contact}</p>
        </header>

        <DocHeading>Professional Summary</DocHeading>
        <p className="mt-2">{resume.summary}</p>

        <DocHeading>Technical Skills</DocHeading>
        <dl className="mt-2 space-y-1">
          {resume.skills.map((group) => (
            <div key={group.label}>
              <dt className="inline font-semibold">{group.label}: </dt>
              <dd className="inline">{group.items}</dd>
            </div>
          ))}
        </dl>

        <DocHeading>Professional Experience</DocHeading>
        {resume.roles.map((role) => (
          <section key={`${role.company}-${role.start}`} className="mt-3.5">
            <p className="font-semibold text-[13.5px]">{role.title}</p>
            <p className="flex flex-wrap justify-between gap-2 text-[12.5px]">
              <span className="italic">
                {role.company}, {role.location}
              </span>
              <span className="text-neutral-700">
                {role.start} – {role.end}
              </span>
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              {role.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        ))}

        {resume.aiProjects.length > 0 && (
          <>
            <DocHeading>AI Engineering Projects</DocHeading>
            {resume.aiProjects.map((project) => (
              <section key={project.name} className="mt-3">
                <p className="text-[13.5px] font-semibold">{project.name}</p>
                {project.role && (
                  <p className="text-[12.5px] italic text-neutral-700">{project.role}</p>
                )}
                <ul className="mt-1.5 list-disc space-y-1 pl-5">
                  {project.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}

        <DocHeading>Education</DocHeading>
        <ul className="mt-2 space-y-2">
          {resume.education.map((item) => (
            <li key={item.qualification}>
              <span className="font-semibold">{item.qualification}</span>
              {" — "}
              {item.institution}, {item.period}
              {item.detail && (
                <span className="block text-[12.5px] text-neutral-700">
                  {item.detail}
                </span>
              )}
            </li>
          ))}
        </ul>

        {resume.certifications.length > 0 && (
          <>
            <DocHeading>Certifications</DocHeading>
            <ul className="mt-2 space-y-2">
              {resume.certifications.map((item) => (
                <li key={item.qualification}>
                  <span className="font-semibold">{item.qualification}</span>
                  {" — "}
                  {item.institution}, {item.period}
                  {item.detail && (
                    <span className="block text-[12.5px] text-neutral-700">
                      {item.detail}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        <DocHeading>Selected Projects</DocHeading>
        <ul className="mt-2 space-y-1.5">
          {resume.projects.map((p) => (
            <li key={p.name}>
              <span className="font-semibold">
                {p.name}
                {p.url ? ` (${p.url})` : ""}:
              </span>{" "}
              {p.summary}
            </li>
          ))}
        </ul>

        <DocHeading>Languages</DocHeading>
        <p className="mt-2">{resume.languages}</p>
      </div>
    </DocumentChrome>
  );
}
