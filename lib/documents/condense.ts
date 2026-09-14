import type { ResumeDoc } from "./types";

/**
 * Trims a résumé to fit one A4 page.
 *
 * Nothing is rewritten or invented: every rule keeps a leading subset of what
 * the admin already wrote, so the one-page build is always a faithful excerpt
 * of the full one. Order the content in the editor with this in mind — the
 * most important roles, bullets and skills first.
 */
export const ONE_PAGE_RULES = {
  /** Sentences kept from the professional summary. */
  summarySentences: 2,
  /** Skill groups kept, and comma-separated items kept per group. */
  skillGroups: 5,
  skillItemsPerGroup: 6,
  /** Roles kept, bullets for the most recent role, bullets for each older role. */
  roles: 3,
  bulletsFirstRole: 3,
  bulletsOtherRoles: 2,
  /** AI projects kept, with one bullet each. */
  aiProjects: 1,
  aiProjectBullets: 1,
  projects: 2,
  education: 2,
  certifications: 1,
} as const;

/**
 * Splits on sentence ends only when followed by whitespace and a capital, so
 * "Node.js", "e.g." and version numbers do not end a sentence.
 */
function firstSentences(text: string, count: number): string {
  const sentences = text.trim().split(/(?<=[.!?])\s+(?=[A-Z"“(])/);
  return sentences.slice(0, count).join(" ").trim();
}

function firstItems(csv: string, count: number): string {
  const items = csv.split(",").map((s) => s.trim()).filter(Boolean);
  return items.slice(0, count).join(", ");
}

export function condenseResume(resume: ResumeDoc, rules = ONE_PAGE_RULES): ResumeDoc {
  return {
    ...resume,
    summary: firstSentences(resume.summary, rules.summarySentences),
    skills: resume.skills
      .slice(0, rules.skillGroups)
      .map((g) => ({ ...g, items: firstItems(g.items, rules.skillItemsPerGroup) })),
    roles: resume.roles.slice(0, rules.roles).map((role, i) => ({
      ...role,
      bullets: role.bullets.slice(0, i === 0 ? rules.bulletsFirstRole : rules.bulletsOtherRoles),
    })),
    aiProjects: resume.aiProjects
      .slice(0, rules.aiProjects)
      .map((p) => ({ ...p, bullets: p.bullets.slice(0, rules.aiProjectBullets) })),
    projects: resume.projects.slice(0, rules.projects),
    education: resume.education.slice(0, rules.education),
    certifications: resume.certifications.slice(0, rules.certifications),
  };
}
