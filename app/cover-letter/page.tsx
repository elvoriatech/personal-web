import type { Metadata } from "next";
import { DocumentChrome } from "@/components/documents/DocumentChrome";
import { getDocuments } from "@/lib/documents/store";
import { CoverLetterSheet } from "@/components/documents/CoverLetterSheet";

export const metadata: Metadata = {
  title: "Cover Letter",
  description: "Cover letter for Zahoor Ahmed — Senior Software Engineer and AI Engineer.",
  robots: { index: false, follow: true },
};

export default async function CoverLetterPage() {
  const { coverLetter } = await getDocuments();

  return (
    <DocumentChrome
      title="Cover Letter"
      downloads={[
        { href: "/api/documents/cover-letter", label: "Download PDF", hint: "Opens the same on every device." },
        { href: "/api/documents/cover-letter?format=docx", label: "Word", hint: "Editable .docx version." },
      ]}
    >
      <CoverLetterSheet letter={coverLetter} />
    </DocumentChrome>
  );
}
