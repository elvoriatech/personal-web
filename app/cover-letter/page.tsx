import type { Metadata } from "next";
import { DocumentChrome } from "@/components/documents/DocumentChrome";
import { getDocuments } from "@/lib/documents/store";
import { fillPlaceholders } from "@/lib/documents/types";

export const metadata: Metadata = {
  title: "Cover Letter",
  description: "Cover letter for Zahoor Ahmed — Senior Software Engineer and AI Engineer.",
  robots: { index: false, follow: true },
};

export default async function CoverLetterPage() {
  const { coverLetter } = await getDocuments();
  const values = {
    role: coverLetter.targetRole || "the advertised",
    company: coverLetter.targetCompany || "your organisation",
  };
  const contact = [
    coverLetter.location,
    coverLetter.phone,
    coverLetter.email,
  ].join("  |  ");

  return (
    <DocumentChrome
      title="Cover Letter"
      downloads={[
        { href: "/api/documents/cover-letter", label: "Download .docx" },
      ]}
    >
      <div className="font-sans text-[13px] leading-[1.65] text-black">
        <header>
          <p className="font-display text-[26px] font-bold leading-tight tracking-tight text-black">
            {coverLetter.fullName}
          </p>
          <p className="mt-1 text-[14px]">{coverLetter.headline}</p>
          <p className="mt-1.5 text-[12px] text-neutral-700">{contact}</p>
        </header>

        <p className="mt-8 text-[12.5px] text-neutral-700">
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <p className="mt-6">{coverLetter.greeting}</p>

        {coverLetter.paragraphs.map((para, i) => (
          <p key={i} className="mt-4">
            {fillPlaceholders(para, values)}
          </p>
        ))}

        <p className="mt-6">{fillPlaceholders(coverLetter.closing, values)}</p>

        <p className="mt-8">Best regards,</p>
        <p className="font-semibold">{coverLetter.fullName}</p>
      </div>
    </DocumentChrome>
  );
}
