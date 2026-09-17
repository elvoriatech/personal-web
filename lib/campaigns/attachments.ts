import type { DocumentFormat } from "@/lib/documents/types";

/**
 * Client-safe attachment metadata.
 *
 * Kept out of personal.ts because that module is "server-only" and pulls in pg,
 * nodemailer and the document builders — importing it from a client component
 * drags all of that into the browser bundle and fails the build.
 */
export const ATTACHMENT_OPTIONS = [
  {
    id: "resume_ats",
    label: "Résumé — Classic",
    basename: "Zahoor_Ahmed_Resume",
  },
  {
    id: "resume_design",
    label: "Résumé — Modern (with photo)",
    basename: "Zahoor_Ahmed_Resume_Modern",
  },
  {
    id: "resume_onepage",
    label: "Résumé — Compact (one page)",
    basename: "Zahoor_Ahmed_Resume_Compact",
  },
  {
    id: "cover_letter",
    label: "Cover letter",
    basename: "Zahoor_Ahmed_Cover_Letter",
  },
] as const;

export type AttachmentId = (typeof ATTACHMENT_OPTIONS)[number]["id"];

/** The name the recipient sees, e.g. Zahoor_Ahmed_Resume.pdf. */
export function attachmentFilename(id: AttachmentId, format: DocumentFormat): string {
  const option = ATTACHMENT_OPTIONS.find((o) => o.id === id);
  return option ? `${option.basename}.${format}` : `attachment.${format}`;
}
