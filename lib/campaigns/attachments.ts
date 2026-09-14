/**
 * Client-safe attachment metadata.
 *
 * Kept out of personal.ts because that module is "server-only" and pulls in pg,
 * nodemailer and the docx builders — importing it from a client component drags
 * all of that into the browser bundle and fails the build.
 */
export const ATTACHMENT_OPTIONS = [
  {
    id: "resume_ats",
    label: "Résumé — Classic",
    filename: "Zahoor_Ahmed_Resume.docx",
  },
  {
    id: "resume_design",
    label: "Résumé — Modern (with photo)",
    filename: "Zahoor_Ahmed_Resume_Modern.docx",
  },
  {
    id: "resume_onepage",
    label: "Résumé — Compact (one page)",
    filename: "Zahoor_Ahmed_Resume_Compact.docx",
  },
  {
    id: "cover_letter",
    label: "Cover letter",
    filename: "Zahoor_Ahmed_Cover_Letter.docx",
  },
] as const;

export type AttachmentId = (typeof ATTACHMENT_OPTIONS)[number]["id"];
