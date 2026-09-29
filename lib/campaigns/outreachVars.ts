/**
 * Placeholders for the one-click outreach sends on /admin/templates.
 * Client-safe: the editor uses it to decide which extra fields to ask for,
 * the server uses it to fill and to refuse a send with anything left over.
 */

import { site } from "@/content/site";

export type OutreachCompany = {
  companyName: string;
  contactName: string;
  website: string;
  industry: string;
};

/** Filled from the company record. */
export const COMPANY_PLACEHOLDERS = [
  "firstName",
  "contactName",
  "company",
  "companyName",
  "website",
  "industry",
] as const;

/** Filled from the site config — the same for every email. */
export const SENDER_PLACEHOLDERS = ["senderName", "portfolioUrl", "phone", "calendarUrl"] as const;

/** What to show under the per-send field for placeholders a company can't fill. */
export const EXTRA_PLACEHOLDER_HINTS: Record<string, { label: string; hint: string }> = {
  observation: {
    label: "What you noticed",
    hint: "One specific thing about their site or business, e.g. “the booking form does not work on a phone”.",
  },
  role: { label: "Role", hint: "The job or project title you are writing about." },
  deadline: { label: "Deadline", hint: "e.g. “Friday” or “the end of the month”." },
};

export function senderVars(): Record<string, string> {
  return {
    senderName: site.name,
    portfolioUrl: site.url,
    phone: site.phone,
    calendarUrl: `${site.url}/#contact`,
  };
}

export function companyVars(c: OutreachCompany): Record<string, string> {
  const contact = c.contactName.trim();
  const company = c.companyName.trim() || "your company";
  return {
    firstName: firstNameOf(contact) || "there",
    contactName: contact || "there",
    company,
    companyName: company,
    website: c.website.replace(/^https?:\/\//i, "").replace(/\/$/, "") || company,
    industry: c.industry.trim() || "your industry",
  };
}

/** "Dr. Anna Weber" greets as "Anna"; "Lena Fischer" as "Lena". */
function firstNameOf(contact: string): string {
  const parts = contact.split(/\s+/).filter((p) => !/^(dr|prof|mr|mrs|ms|herr|frau)\.?$/i.test(p));
  return parts[0] ?? "";
}

/** Every distinct {{name}} in the text, in order of first appearance. */
export function findPlaceholders(...texts: string[]): string[] {
  const seen = new Set<string>();
  for (const t of texts) {
    for (const m of t.matchAll(/\{\{\s*(\w+)\s*\}\}/g)) seen.add(m[1]);
  }
  return [...seen];
}

/** Placeholders in a template that neither the company nor the sender can fill. */
export function extraPlaceholders(subject: string, body: string): string[] {
  const known = new Set<string>([...COMPANY_PLACEHOLDERS, ...SENDER_PLACEHOLDERS]);
  return findPlaceholders(subject, body).filter((p) => !known.has(p));
}

/** Only short string values under simple keys — admin input, but still input. */
export function sanitizeExtras(value: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!value || typeof value !== "object") return out;
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (/^\w{1,40}$/.test(key) && typeof v === "string" && v.trim()) out[key] = v.trim().slice(0, 300);
  }
  return out;
}
