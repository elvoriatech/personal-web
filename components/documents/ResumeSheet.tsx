import type { ReactNode } from "react";
import type { ResumeDoc, ResumeVariant } from "@/lib/documents/types";

/**
 * HTML rendering of the résumé in either template. The .docx builders in
 * lib/documents/docx.ts are the source of truth for what is sent; this mirrors
 * their section order and hierarchy so the admin preview and the public page
 * show the same document. Web fonts stand in for Calibri, so line breaks will
 * differ slightly from Word — the content and structure do not.
 *
 * No hooks, no client APIs: renders on the server for /resume and inside a
 * client dialog in the admin.
 */
export function ResumeSheet({
  resume,
  variant,
  photoSrc,
}: {
  resume: ResumeDoc;
  variant: ResumeVariant;
  /** Two-column only. null = build without a photo. */
  photoSrc?: string | null;
}) {
  return variant === "design" ? (
    <DesignSheet resume={resume} photoSrc={photoSrc ?? null} />
  ) : (
    <AtsSheet resume={resume} />
  );
}

/* ------------------------------ single column ----------------------------- */

function AtsHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-7 border-b border-neutral-300 pb-1 font-display text-[12.5px] font-bold uppercase tracking-[0.1em] text-black first:mt-0">
      {children}
    </h2>
  );
}

function AtsSheet({ resume }: { resume: ResumeDoc }) {
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

  return (
    <div className="font-sans text-[13px] leading-[1.55] text-black">
      <header>
        <p className="font-display text-[26px] font-bold leading-tight tracking-tight text-black">
          {resume.fullName}
        </p>
        <p className="mt-1 text-[14px]">{resume.headline}</p>
        <p className="mt-1.5 text-[12px] text-neutral-700">{contact}</p>
      </header>

      <AtsHeading>Professional Summary</AtsHeading>
      <p className="mt-2">{resume.summary}</p>

      <AtsHeading>Technical Skills</AtsHeading>
      <dl className="mt-2 space-y-1">
        {resume.skills.map((group, i) => (
          <div key={`${group.label}-${i}`}>
            <dt className="inline font-semibold">{group.label}: </dt>
            <dd className="inline">{group.items}</dd>
          </div>
        ))}
      </dl>

      <AtsHeading>Professional Experience</AtsHeading>
      {resume.roles.map((role, i) => (
        <section key={`${role.company}-${role.start}-${i}`} className="mt-3.5">
          <p className="text-[13.5px] font-semibold">{role.title}</p>
          <p className="flex flex-wrap justify-between gap-2 text-[12.5px]">
            <span className="italic">
              {role.company}, {role.location}
            </span>
            <span className="text-neutral-700">
              {role.start} – {role.end}
            </span>
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            {role.bullets.map((b, j) => (
              <li key={j}>{b}</li>
            ))}
          </ul>
        </section>
      ))}

      {resume.aiProjects.length > 0 && (
        <>
          <AtsHeading>AI Engineering Projects</AtsHeading>
          {resume.aiProjects.map((project, i) => (
            <section key={`${project.name}-${i}`} className="mt-3">
              <p className="text-[13.5px] font-semibold">{project.name}</p>
              {project.role && (
                <p className="text-[12.5px] italic text-neutral-700">{project.role}</p>
              )}
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                {project.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      <AtsHeading>Education</AtsHeading>
      <ul className="mt-2 space-y-2">
        {resume.education.map((item, i) => (
          <li key={`${item.qualification}-${i}`}>
            <span className="font-semibold">{item.qualification}</span>
            {" — "}
            {item.institution}, {item.period}
            {item.detail && (
              <span className="block text-[12.5px] text-neutral-700">{item.detail}</span>
            )}
          </li>
        ))}
      </ul>

      {resume.certifications.length > 0 && (
        <>
          <AtsHeading>Certifications</AtsHeading>
          <ul className="mt-2 space-y-2">
            {resume.certifications.map((item, i) => (
              <li key={`${item.qualification}-${i}`}>
                <span className="font-semibold">{item.qualification}</span>
                {" — "}
                {item.institution}, {item.period}
                {item.detail && (
                  <span className="block text-[12.5px] text-neutral-700">{item.detail}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <AtsHeading>Selected Projects</AtsHeading>
      <ul className="mt-2 space-y-1.5">
        {resume.projects.map((p, i) => (
          <li key={`${p.name}-${i}`}>
            <span className="font-semibold">
              {p.name}
              {p.url ? ` (${p.url})` : ""}:
            </span>{" "}
            {p.summary}
          </li>
        ))}
      </ul>

      <AtsHeading>Languages</AtsHeading>
      <p className="mt-2">{resume.languages}</p>
    </div>
  );
}

/* ------------------------------- two column ------------------------------- */

/* Colours match lib/documents/docx.ts: SIDEBAR_BG F3F1FE, ACCENT 6D4FD0. */

function SideHeading({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 mb-1.5 font-display text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#6D4FD0] first:mt-0">
      {children}
    </p>
  );
}

function MainHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-5 border-b border-[#6D4FD0]/30 pb-1 font-display text-[11.5px] font-bold uppercase tracking-[0.12em] text-[#6D4FD0] first:mt-0">
      {children}
    </h2>
  );
}

function DesignSheet({ resume, photoSrc }: { resume: ResumeDoc; photoSrc: string | null }) {
  const contact: [string, string][] = [
    ["☎", resume.phone],
    ["✉", resume.email],
    ["◉", resume.location],
    ["⚑", resume.extras],
  ];

  return (
    <div className="grid grid-cols-[32.5%_1fr] font-sans text-[12.5px] leading-[1.5] text-black">
      {/* ------------------------------ sidebar ------------------------------ */}
      <aside className="bg-[#F3F1FE] px-4 py-5">
        {photoSrc && (
          // eslint-disable-next-line @next/next/no-img-element -- data URL or no-store route
          <img
            src={photoSrc}
            alt=""
            width={110}
            height={110}
            className="mx-auto mb-3 block h-[110px] w-[110px] object-cover"
          />
        )}
        <p className="text-center text-[15px] font-bold leading-tight">{resume.fullName}</p>

        <SideHeading>Contact</SideHeading>
        <ul className="space-y-1 text-[11px]">
          {contact
            .filter(([, v]) => v)
            .map(([glyph, value]) => (
              <li key={glyph} className="flex gap-2 break-words">
                <span className="text-[#6D4FD0]" aria-hidden="true">
                  {glyph}
                </span>
                <span className="min-w-0 break-all">{value}</span>
              </li>
            ))}
        </ul>

        <SideHeading>Skills</SideHeading>
        <div className="space-y-2">
          {resume.skills.map((group, i) => (
            <div key={`${group.label}-${i}`}>
              <p className="text-[11px] font-bold">{group.label}</p>
              <p className="text-[10.5px] leading-[1.5] text-neutral-800">{group.items}</p>
            </div>
          ))}
        </div>

        <SideHeading>Education</SideHeading>
        <div className="space-y-2">
          {[...resume.education, ...resume.certifications].map((item, i) => (
            <div key={`${item.qualification}-${i}`}>
              <p className="text-[11px] font-bold">{item.qualification}</p>
              <p className="text-[10.5px] text-neutral-800">
                {item.institution}, {item.period}
              </p>
            </div>
          ))}
        </div>

        <SideHeading>Languages</SideHeading>
        <p className="text-[10.5px] text-neutral-800">{resume.languages}</p>
      </aside>

      {/* -------------------------------- main -------------------------------- */}
      <main className="px-6 py-5">
        <p className="text-[14px] font-bold">{resume.headline}</p>

        <MainHeading>Profile</MainHeading>
        <p className="mt-2 text-[12px]">{resume.summary}</p>

        <MainHeading>Experience</MainHeading>
        {resume.roles.map((role, i) => (
          <section key={`${role.company}-${role.start}-${i}`} className="mt-3">
            <p className="text-[12.5px] font-bold">{role.title}</p>
            <p className="text-[11px] italic text-[#555555]">
              {role.company}, {role.location} &nbsp;|&nbsp; {role.start} - {role.end}
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px]">
              {role.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </section>
        ))}

        {resume.aiProjects.length > 0 && (
          <>
            <MainHeading>AI Engineering Projects</MainHeading>
            {resume.aiProjects.map((project, i) => (
              <section key={`${project.name}-${i}`} className="mt-3">
                <p className="text-[12.5px] font-bold">{project.name}</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px]">
                  {project.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}

        <MainHeading>Selected Projects</MainHeading>
        <ul className="mt-2 space-y-1 text-[12px]">
          {resume.projects.map((p, i) => (
            <li key={`${p.name}-${i}`}>
              <span className="font-bold">
                {p.name}
                {p.url ? ` (${p.url})` : ""}:
              </span>{" "}
              {p.summary}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
