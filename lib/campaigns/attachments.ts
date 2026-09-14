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
    label: "Résumé — single column (ATS)",
    filename: "Zahoor_Ahmed_Resume_ATS.docx",
  },
  {
    id: "resume_design",
    label: "Résumé — two column (with photo)",
    filename: "Zahoor_Ahmed_Resume_TwoColumn.docx",
  },
  {
    id: "resume_onepage",
    label: "Résumé — one page",
    filename: "Zahoor_Ahmed_Resume_OnePage.docx",
  },
  {
    id: "cover_letter",
    label: "Cover letter",
    filename: "Zahoor_Ahmed_Cover_Letter.docx",
  },
] as const;

export type AttachmentId = (typeof ATTACHMENT_OPTIONS)[number]["id"];
