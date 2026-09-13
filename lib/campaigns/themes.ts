/**
 * Visual themes for outgoing email. Client-safe — imported by the admin UI as
 * well as the server-side layout, so nothing here may touch Node APIs.
 */
export type EmailTheme = "branded" | "plain";

export const EMAIL_THEMES: ReadonlyArray<{
  id: EmailTheme;
  label: string;
  description: string;
  /** Short hint shown under the label in the picker. */
  bestFor: string;
}> = [
  {
    id: "plain",
    label: "Plain letter",
    description:
      "White background, no header, a text signature. Reads like an email a person typed.",
    bestFor: "Cold outreach — plain messages get noticeably more replies than designed ones.",
  },
  {
    id: "branded",
    label: "Branded card",
    description: "Purple header with your monogram, matching the website.",
    bestFor: "Warm leads, applications and replies, where the brand is a plus.",
  },
];

/** Stored default for rows created before the theme column existed. */
export const DEFAULT_EMAIL_THEME: EmailTheme = "branded";

/** What the campaign composer preselects. */
export const DEFAULT_CAMPAIGN_THEME: EmailTheme = "plain";

export function isEmailTheme(value: unknown): value is EmailTheme {
  return value === "branded" || value === "plain";
}

export function coerceEmailTheme(value: unknown, fallback: EmailTheme = DEFAULT_EMAIL_THEME): EmailTheme {
  return isEmailTheme(value) ? value : fallback;
}
