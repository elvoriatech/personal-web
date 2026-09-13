/** Shapes shared by the ATS views, the .docx exporters and the admin editors. */

/** "ats" = single column, no tables or images; "design" = two-column sidebar with photo. */
export type ResumeVariant = "ats" | "design";

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
