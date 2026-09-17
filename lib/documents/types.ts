/** Shapes shared by the résumé views, the .docx exporters and the admin editors. */

/**
 * Résumé themes. The ids are stored in saved bundles, so they never change;
 * only the labels shown to people do.
 *
 * "ats"     Classic — single column, no tables or images; the full résumé
 * "design"  Modern  — two-column sidebar with photo
 * "compact" Compact — the Classic layout condensed to one page (lib/documents/condense.ts)
 */
export type ResumeVariant = "ats" | "design" | "compact";
export const RESUME_VARIANTS: ResumeVariant[] = ["ats", "design", "compact"];

export const RESUME_VARIANT_LABELS: Record<ResumeVariant, string> = {
  ats: "Classic",
  design: "Modern",
  compact: "Compact",
};

/**
 * File format a document is delivered in. PDF is the default everywhere: it
 * looks identical on every machine and is what recruiters and clients expect
 * as an attachment. Word stays available for anyone who asks to edit it.
 */
export type DocumentFormat = "pdf" | "docx";
export const DOCUMENT_FORMATS: DocumentFormat[] = ["pdf", "docx"];
export const DEFAULT_DOCUMENT_FORMAT: DocumentFormat = "pdf";

export const DOCUMENT_FORMAT_LABELS: Record<DocumentFormat, string> = {
  pdf: "PDF",
  docx: "Word",
};

export const DOCUMENT_FORMAT_HINTS: Record<DocumentFormat, string> = {
  pdf: "Opens the same everywhere. The safe choice for an attachment.",
  docx: "Editable in Word. Send only when someone asks for it.",
};

export const DOCUMENT_CONTENT_TYPES: Record<DocumentFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function coerceDocumentFormat(value: unknown): DocumentFormat {
  return value === "docx" ? "docx" : DEFAULT_DOCUMENT_FORMAT;
}

/** Download names without an extension. Classic is the default, so it has the plain name. */
export const RESUME_VARIANT_BASENAMES: Record<ResumeVariant, string> = {
  ats: "Zahoor_Ahmed_Resume",
  design: "Zahoor_Ahmed_Resume_Modern",
  compact: "Zahoor_Ahmed_Resume_Compact",
};

export function resumeFilename(variant: ResumeVariant, format: DocumentFormat): string {
  return `${RESUME_VARIANT_BASENAMES[variant]}.${format}`;
}

/** How the two-column photo is cropped. */
export type PhotoShape = "square" | "circle" | "rounded";
export const PHOTO_SHAPES: PhotoShape[] = ["square", "circle", "rounded"];

export type ResumeRole = {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};

export type ResumeSkillGroup = { label: string; items: string };

export type ResumeEducation = {
  qualification: string;
  institution: string;
  period: string;
  detail?: string;
};

export type ResumeProject = { name: string; url: string; summary: string };

/** AI work needs evidence, not just a skills line — hence its own section. */
export type ResumeAiProject = {
  name: string;
  role: string;
  bullets: string[];
};

export type ResumeDoc = {
  fullName: string;
  headline: string;
  location: string;
  phone: string;
  email: string;
  extras: string;
  /** Recruiters look for these; left blank they are simply omitted. */
  linkedin: string;
  github: string;
  summary: string;
  skills: ResumeSkillGroup[];
  roles: ResumeRole[];
  aiProjects: ResumeAiProject[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications: ResumeEducation[];
  languages: string;
  /**
   * Which build the public page offers first and emails attach by default.
   * Optional so bundles saved before this existed keep loading; treat unset as "ats".
   */
  preferredVariant?: ResumeVariant;
  /**
   * Photo for the two-column build, as a data: URL produced by the admin uploader.
   * Unset → the portrait bundled with the site; "" → build without a photo.
   */
  photoDataUrl?: string;
  /** Crop shape for that photo. Unset → square, which is what the original file used. */
  photoShape?: PhotoShape;
};

export type CoverLetterDoc = {
  fullName: string;
  headline: string;
  location: string;
  phone: string;
  email: string;
  /** Filled in per application; both support {{role}} / {{company}} below. */
  targetRole: string;
  targetCompany: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  purpose: string;
  subject: string;
  body: string;
  /**
   * Archived templates stay in the bundle but are hidden from the working
   * list; deleting is a second, explicit step from the archive. ISO date.
   */
  archivedAt?: string;
};

export type DocumentBundle = {
  resume: ResumeDoc;
  coverLetter: CoverLetterDoc;
  emailTemplates: EmailTemplate[];
};

/** Replaces {{placeholders}} with supplied values, leaving unknown ones intact. */
export function fillPlaceholders(
  text: string,
  values: Record<string, string>
): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    values[key] !== undefined && values[key] !== "" ? values[key] : match
  );
}
