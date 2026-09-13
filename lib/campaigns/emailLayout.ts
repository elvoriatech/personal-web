import { site } from "@/content/site";
import { DEFAULT_EMAIL_THEME, type EmailTheme } from "./themes";

export function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Brand colours, matched to the site.
 *
 * Gmail and Outlook strip `linear-gradient`, so every gradient is paired with a
 * solid `bgcolor` fallback on the same cell — the header degrades to flat
 * purple rather than to white text on white.
 */
export const EMAIL_THEME = {
  accent: "#7C5CE0",
  accentDeep: "#6D4FD0",
  accentTint: "#F3F1FE",
  ink: "#0C1218",
  bodyText: "#43404C",
  muted: "#6F6A78",
  line: "#E5E4ED",
  canvas: "#F3F3F9",
  font: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif",
} as const;

const { accent: ACCENT, accentDeep: ACCENT_DEEP, ink: INK, bodyText: BODY_TEXT, muted: MUTED, line: LINE, canvas: CANVAS, font: FONT } =
  EMAIL_THEME;

const HEADER_BG = `background-color:${ACCENT};background-image:linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DEEP} 100%);`;
const CTA_BG = `background-color:${ACCENT};background-image:linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_DEEP} 100%);`;

export type WrapEmailOptions = {
  preheader?: string;
  /** Adds the permanent opt-out line required for cold outreach. */
  showOptOut?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  /** Visual treatment. Defaults to the branded card for backwards compatibility. */
  theme?: EmailTheme;
};

function siteBase(): string {
  return site.url.replace(/\/$/, "");
}

const OPT_OUT_COPY =
  "You received this because I thought my work might be relevant to your business. Reply with &ldquo;no thanks&rdquo; and I will not contact you again.";

function head(title: string): string {
  return `<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
</head>`;
}

function preheaderDiv(text: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${text}</div>`;
}

/**
 * Renders the body in the chosen theme. Both themes are table-based, and the
 * monogram in the branded header is drawn with cells rather than an image, so
 * it renders even when a client blocks remote images — which most do by
 * default for a first-time sender.
 */
export function wrapCampaignEmailHtml(
  bodyHtml: string,
  opts: WrapEmailOptions = {}
): string {
  const theme = opts.theme ?? DEFAULT_EMAIL_THEME;
  return theme === "plain" ? renderPlain(bodyHtml, opts) : renderBranded(bodyHtml, opts);
}

/* --------------------------------- plain --------------------------------- */

/**
 * Letter-style: no header, no card, a text signature. Deliberately looks like
 * a message typed in a mail client — for cold outreach this is not a
 * downgrade, it is the whole point.
 */
function renderPlain(bodyHtml: string, opts: WrapEmailOptions): string {
  const name = escapeHtml(site.name);
  const base = siteBase();
  const preheader = escapeHtml(opts.preheader ?? site.tagline);
  const textColor = "#1F1D24";

  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `<p style="margin:0 0 18px 0;font-family:${FONT};font-size:15px;line-height:1.7;color:${textColor};">
           <a href="${escapeHtml(opts.ctaHref)}" target="_blank" rel="noopener noreferrer" style="color:${ACCENT_DEEP};text-decoration:underline;">${escapeHtml(opts.ctaLabel)}</a>
         </p>`
      : "";

  const optOut = opts.showOptOut
    ? `<p style="margin:18px 0 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};">${OPT_OUT_COPY}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
${head(name)}
<body style="margin:0;padding:0;background-color:#ffffff;font-family:${FONT};">
  ${preheaderDiv(preheader)}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="border-collapse:collapse;background-color:#ffffff;">
    <tr>
      <td align="left" style="padding:28px 24px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr>
            <td style="font-family:${FONT};font-size:15px;line-height:1.7;color:${textColor};">
              ${bodyHtml}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding-top:6px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="border-left:3px solid ${ACCENT};padding:2px 0 2px 14px;">
                    <p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.5;color:${INK};font-weight:600;">${name}</p>
                    <p style="margin:1px 0 0 0;font-family:${FONT};font-size:13px;line-height:1.5;color:${BODY_TEXT};">${escapeHtml(site.tagline)}</p>
                    <p style="margin:6px 0 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED};">
                      ${escapeHtml(site.location)}<br />
                      <a href="mailto:${escapeHtml(site.email)}" style="color:${ACCENT_DEEP};text-decoration:none;">${escapeHtml(site.email)}</a>
                      &nbsp;&middot;&nbsp;
                      <a href="tel:${escapeHtml(site.phone.replace(/\s+/g, ""))}" style="color:${ACCENT_DEEP};text-decoration:none;">${escapeHtml(site.phone)}</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${base}" target="_blank" rel="noopener noreferrer" style="color:${ACCENT_DEEP};text-decoration:none;">${escapeHtml(base.replace(/^https?:\/\//, ""))}</a>
                    </p>
                  </td>
                </tr>
              </table>
              ${optOut}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* -------------------------------- branded -------------------------------- */

function renderBranded(bodyHtml: string, opts: WrapEmailOptions): string {
  const name = escapeHtml(site.name);
  const base = siteBase();
  const preheader = escapeHtml(opts.preheader ?? site.tagline);
  const year = new Date().getFullYear();
  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `
          <tr>
            <td align="left" style="padding:6px 32px 30px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td bgcolor="${ACCENT}" style="${CTA_BG}border-radius:999px;">
                    <a href="${escapeHtml(opts.ctaHref)}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:13px 30px;font-family:${FONT};font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                      ${escapeHtml(opts.ctaLabel)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
      : "";

  const optOut = opts.showOptOut
    ? `
              <p style="margin:14px 0 0 0;font-family:${FONT};font-size:11.5px;line-height:1.6;color:${MUTED};">${OPT_OUT_COPY}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
${head(name)}
<body style="margin:0;padding:0;background-color:${CANVAS};font-family:${FONT};">
  ${preheaderDiv(preheader)}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${CANVAS}" style="border-collapse:collapse;background-color:${CANVAS};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="border-collapse:collapse;width:100%;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td bgcolor="${ACCENT}" style="${HEADER_BG}padding:22px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td width="42" style="width:42px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td align="center" valign="middle" bgcolor="#ffffff" width="42" height="42"
                            style="width:42px;height:42px;border-radius:11px;background-color:#ffffff;font-family:${FONT};font-size:15px;font-weight:700;color:${ACCENT_DEEP};letter-spacing:-0.02em;">
                          ${escapeHtml(site.initials)}
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding-left:14px;">
                    <div style="font-family:${FONT};font-size:16px;font-weight:600;color:#ffffff;line-height:1.3;">${name}</div>
                    <div style="font-family:${FONT};font-size:12px;color:#EDE8FD;line-height:1.4;">${escapeHtml(site.tagline)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 32px 6px 32px;font-family:${FONT};font-size:15px;line-height:1.68;color:${BODY_TEXT};">
              ${bodyHtml}
            </td>
          </tr>
          ${cta}

          <!-- Footer -->
          <tr>
            <td style="padding:22px 32px 26px 32px;border-top:1px solid ${LINE};">
              <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;color:${INK};font-weight:600;">${name}</p>
              <p style="margin:3px 0 0 0;font-family:${FONT};font-size:12.5px;line-height:1.6;color:${MUTED};">
                ${escapeHtml(site.location)}<br />
                <a href="mailto:${escapeHtml(site.email)}" style="color:${ACCENT_DEEP};text-decoration:none;">${escapeHtml(site.email)}</a>
                &nbsp;·&nbsp;
                <a href="${base}" target="_blank" rel="noopener noreferrer" style="color:${ACCENT_DEEP};text-decoration:none;">${escapeHtml(base.replace(/^https?:\/\//, ""))}</a>
              </p>
              ${optOut}
              <p style="margin:14px 0 0 0;font-family:${FONT};font-size:11px;color:${MUTED};">&copy; ${year} ${name}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Turns the plain-text body an admin types into safe HTML paragraphs.
 * Input is escaped first, so a template can never inject markup.
 */
export function plainTextToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(renderBlock)
    .join("");
}

/**
 * A block is a run of lines with no blank line between them. Consecutive
 * bullet lines become one list; anything else becomes a paragraph — so an
 * intro line followed directly by bullets renders as intro + list, the way
 * the author laid it out, rather than as literal "- " text.
 */
function renderBlock(block: string): string {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) items.push(lines[i++].slice(2));
      out.push(
        `<ul style="margin:0 0 16px 0;padding-left:20px;">${items
          .map((item) => `<li style="margin:0 0 6px 0;">${escapeHtml(item)}</li>`)
          .join("")}</ul>`
      );
    } else {
      const para: string[] = [];
      while (i < lines.length && !lines[i].startsWith("- ")) para.push(lines[i++]);
      // An intro line directly above a list sits tight to it, like a heading.
      const tight = i < lines.length ? "margin:0 0 8px 0;" : "margin:0 0 16px 0;";
      out.push(`<p style="${tight}">${para.map(escapeHtml).join("<br />")}</p>`);
    }
  }
  return out.join("");
}
