import { site } from "@/content/site";

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
const ACCENT = "#7C5CE0";
const ACCENT_DEEP = "#6D4FD0";
const INK = "#0C1218";
const BODY_TEXT = "#43404C";
const MUTED = "#6F6A78";
const LINE = "#E5E4ED";
const CANVAS = "#F3F3F9";

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

const HEADER_BG = `background-color:${ACCENT};background-image:linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DEEP} 100%);`;
const CTA_BG = `background-color:${ACCENT};background-image:linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_DEEP} 100%);`;

export type WrapEmailOptions = {
  preheader?: string;
  /** Adds the permanent opt-out line required for cold outreach. */
  showOptOut?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
};

function siteBase(): string {
  return site.url.replace(/\/$/, "");
}

/**
 * Table-based HTML shell. The monogram is drawn with table cells rather than an
 * image, so it renders even when a client blocks remote images — which most do
 * by default for a first-time sender.
 */
export function wrapCampaignEmailHtml(
  bodyHtml: string,
  opts: WrapEmailOptions = {}
): string {
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
              <p style="margin:14px 0 0 0;font-family:${FONT};font-size:11.5px;line-height:1.6;color:${MUTED};">
                You received this because I thought my work might be relevant to your business.
                Reply with &ldquo;no thanks&rdquo; and I will not contact you again.
              </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${name}</title>
</head>
<body style="margin:0;padding:0;background-color:${CANVAS};font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheader}</div>
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
                    <div style="font-family:${FONT};font-size:12px;color:#EDE8FD;line-height:1.4;">Senior Software Engineer &amp; AI Engineer</div>
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
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- "))) {
        const items = lines
          .map((l) => `<li style="margin:0 0 6px 0;">${escapeHtml(l.slice(2))}</li>`)
          .join("");
        return `<ul style="margin:0 0 16px 0;padding-left:20px;">${items}</ul>`;
      }
      return `<p style="margin:0 0 16px 0;">${escapeHtml(block).replaceAll("\n", "<br />")}</p>`;
    })
    .join("");
}
