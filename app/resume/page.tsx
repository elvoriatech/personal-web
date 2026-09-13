import type { Metadata } from "next";
import { DocumentChrome } from "@/components/documents/DocumentChrome";
import { ResumeSheet } from "@/components/documents/ResumeSheet";
import { getDocuments } from "@/lib/documents/store";

export const metadata: Metadata = {
  title: "Résumé",
  description:
    "ATS-friendly résumé for Zahoor Ahmed — Senior Software Engineer and AI Engineer.",
  robots: { index: false, follow: true },
};

export default async function ResumePage() {
  const { resume } = await getDocuments();
  const ats = {
    href: "/api/documents/resume?variant=ats",
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

      <ResumeSheet resume={resume} variant="ats" />
    </DocumentChrome>
  );
}
