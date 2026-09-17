import type { Metadata } from "next";
import { DocumentChrome } from "@/components/documents/DocumentChrome";
import { ResumeSheet } from "@/components/documents/ResumeSheet";
import { getDocuments } from "@/lib/documents/store";
import { RESUME_VARIANT_LABELS as LABEL } from "@/lib/documents/types";

export const metadata: Metadata = {
  title: "Résumé",
  description:
    "Résumé of Zahoor Ahmed — Senior Software Engineer and AI Engineer.",
  robots: { index: false, follow: true },
};

export default async function ResumePage() {
  const { resume } = await getDocuments();
  const ats = {
    href: "/api/documents/resume?variant=ats",
    label: LABEL.ats,
    hint: "Single column. Upload this one to job portals — no tables, no images, parses cleanly.",
  };
  const design = {
    href: "/api/documents/resume?variant=design",
    label: resume.photoDataUrl === "" ? LABEL.design : `${LABEL.design} (with photo)`,
    hint: "Two columns, for emailing a person directly. Has a sidebar, so keep it off job portals.",
  };
  const compact = {
    href: "/api/documents/resume?variant=compact",
    label: LABEL.compact,
    hint: "The Classic résumé condensed to one page.",
  };
  // The template chosen in the admin leads; the others stay one click away.
  const all = { ats, design, compact };
  const preferred = resume.preferredVariant ?? "ats";
  const order = [preferred, ...(["ats", "design", "compact"] as const).filter((v) => v !== preferred)];
  const downloads = [
    ...order.map((v) => all[v]),
    // Every link above serves a PDF; this one covers anyone who wants to edit it.
    {
      href: `/api/documents/resume?variant=${preferred}&format=docx`,
      label: "Word",
      hint: `Editable .docx of the ${LABEL[preferred]} theme.`,
    },
  ];

  return (
    <DocumentChrome title="Résumé" downloads={downloads}>
      <p className="mb-6 rounded-xl border border-line bg-bg-violet px-4 py-3 text-[12.5px] leading-[1.6] text-body print:hidden">
        <strong className="text-ink">Three themes, one source.</strong> The preview
        below is the Classic theme — upload that to job portals, where tables and
        photos get mangled. Modern adds your photo and a sidebar for when a person
        reads it directly, and Compact fits everything on one page.
      </p>

      <ResumeSheet resume={resume} variant="ats" />
    </DocumentChrome>
  );
}
