import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthConfigured, isSignedIn } from "@/lib/auth";
import { getDocuments, persistenceMode } from "@/lib/documents/store";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  if (!(await isSignedIn())) redirect("/admin/login");

  const { resume, coverLetter, emailTemplates } = await getDocuments();
  const mode = persistenceMode();

  const cards = [
    {
      href: "/admin/resume",
      title: "Résumé",
      detail: `${resume.roles.length} roles · ${resume.aiProjects.length} AI projects · ${resume.skills.length} skill groups`,
    },
    {
      href: "/admin/cover-letter",
      title: "Cover Letter",
      detail: `${coverLetter.paragraphs.length} paragraphs · targets ${coverLetter.targetCompany || "no company set"}`,
    },
    {
      href: "/admin/templates",
      title: "Outreach Templates",
      detail: `${emailTemplates.length} templates for winning project work`,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-[24px] font-semibold text-ink">Overview</h1>
      <p className="mt-1.5 text-[13.5px] text-body">
        Edit what appears on your public documents. Storage:{" "}
        <strong className="text-ink">{mode.replace("-", " ")}</strong>.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card-surface block p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40"
          >
            <p className="font-display text-[15px] font-semibold text-ink">{c.title}</p>
            <p className="mt-1.5 text-[12.5px] text-body">{c.detail}</p>
          </Link>
        ))}
      </div>

      <div className="card-surface mt-6 p-5">
        <h2 className="font-display text-[14px] font-semibold text-ink">
          Download current documents
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { href: "/api/documents/resume?variant=ats", label: "Résumé — Classic (PDF)" },
            { href: "/api/documents/resume?variant=design", label: "Résumé — Modern (PDF)" },
            { href: "/api/documents/resume?variant=compact", label: "Résumé — Compact (PDF)" },
            { href: "/api/documents/cover-letter", label: "Cover letter (PDF)" },
          ].map((d) => (
            <a
              key={d.href}
              href={d.href}
              className="inline-flex min-h-[38px] items-center rounded-pill border border-line px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
            >
              {d.label}
            </a>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-muted">
          Previews: <Link href="/resume" className="text-accent-deep">/resume</Link>{" "}
          and <Link href="/cover-letter" className="text-accent-deep">/cover-letter</Link>.
        </p>
      </div>

      {!isAuthConfigured() && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-800">
          ADMIN_PASSWORD or ADMIN_SESSION_SECRET is missing — set both before deploying.
        </p>
      )}
    </div>
  );
}
