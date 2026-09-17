import "server-only";

import {
  buildCoverLetterDocx,
  buildResumeCompactDocx,
  buildResumeDesignDocx,
  buildResumeDocx,
} from "./docx";
import {
  buildCoverLetterPdf,
  buildResumeCompactPdf,
  buildResumeDesignPdf,
  buildResumePdf,
} from "./pdf";
import {
  resumeFilename,
  type CoverLetterDoc,
  type DocumentFormat,
  type ResumeDoc,
  type ResumeVariant,
} from "./types";

/**
 * One place that maps (document, theme, format) to bytes, so the download
 * route, the preview and the email attachments can never drift apart.
 */

export type BuiltDocument = { filename: string; content: Buffer; contentType: string };

export function buildResumeBuffer(
  resume: ResumeDoc,
  variant: ResumeVariant,
  format: DocumentFormat
): Promise<Buffer> {
  if (format === "pdf") {
    if (variant === "design") return buildResumeDesignPdf(resume);
    if (variant === "compact") return buildResumeCompactPdf(resume);
    return buildResumePdf(resume);
  }
  if (variant === "design") return buildResumeDesignDocx(resume);
  if (variant === "compact") return buildResumeCompactDocx(resume);
  return buildResumeDocx(resume);
}

export function buildCoverLetterBuffer(
  letter: CoverLetterDoc,
  format: DocumentFormat
): Promise<Buffer> {
  return format === "pdf" ? buildCoverLetterPdf(letter) : buildCoverLetterDocx(letter);
}

export { resumeFilename };

/** Adds the target company so downloads for different applications do not overwrite each other. */
export function coverLetterFilename(letter: CoverLetterDoc, format: DocumentFormat): string {
  const company = letter.targetCompany
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  const base = company ? `Zahoor_Ahmed_Cover_Letter_${company}` : "Zahoor_Ahmed_Cover_Letter";
  return `${base}.${format}`;
}
