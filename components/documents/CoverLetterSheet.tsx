import { fillPlaceholders, type CoverLetterDoc } from "@/lib/documents/types";

/** The fallbacks the .docx builder uses when no target is set — keep in sync. */
export function coverLetterValues(letter: CoverLetterDoc) {
  return {
    role: letter.targetRole.trim() || "the advertised",
    company: letter.targetCompany.trim() || "your organisation",
  };
}

export function coverLetterDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/**
 * HTML rendering of the cover letter, mirroring buildCoverLetterDocx in
 * lib/documents/docx.ts: contact block, date, greeting, body, closing,
 * sign-off. Used by the public page and the admin preview so both show the
 * same letter. No hooks — renders on the server and inside a client dialog.
 */
export function CoverLetterSheet({ letter }: { letter: CoverLetterDoc }) {
  const values = coverLetterValues(letter);
  const contact = [letter.location, letter.phone, letter.email].filter(Boolean).join("  |  ");

  return (
    <div className="font-sans text-[13px] leading-[1.65] text-black">
      <header>
        <p className="font-display text-[26px] font-bold leading-tight tracking-tight text-black">
          {letter.fullName}
        </p>
        <p className="mt-1 text-[14px]">{letter.headline}</p>
        <p className="mt-1.5 text-[12px] text-neutral-700">{contact}</p>
      </header>

      <p className="mt-8 text-[12.5px] text-neutral-700">{coverLetterDate()}</p>

      <p className="mt-6">{letter.greeting}</p>

      {letter.paragraphs.map((para, i) => (
        <p key={i} className="mt-4">
          {fillPlaceholders(para, values)}
        </p>
      ))}

      <p className="mt-6">{fillPlaceholders(letter.closing, values)}</p>

      <p className="mt-8">Best regards,</p>
      <p className="font-semibold">{letter.fullName}</p>
    </div>
  );
}
