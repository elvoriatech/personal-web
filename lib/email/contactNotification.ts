import { site } from "@/content/site";
import { EMAIL_THEME, escapeHtml } from "@/lib/campaigns/emailLayout";

/**
 * The email Zahoor receives when someone submits the contact form.
 *
 * This is an INBOUND notification, so it deliberately does not reuse
 * `wrapCampaignEmailHtml` — that shell signs off with Zahoor's own signature,
 * which reads oddly on mail addressed to him. It shares the design tokens so
 * the two still look like one system.
 *
 * Same client constraints as the campaign layout: tables not flexbox, solid
 * `bgcolor` fallbacks beside every gradient, no remote images.
 */

export type ContactNotificationInput = {
  name: string;
  email: string;
  message: string;
  /** Defaults to now. Injected by tests so output is stable. */
  receivedAt?: Date;
};

export type ContactNotification = {
  subject: string;
  html: string;
  text: string;
};

const { accent, accentDeep, accentTint, ink, bodyText, muted, line, canvas, font } = EMAIL_THEME;

const HEADER_BG = `background-color:${accent};background-image:linear-gradient(135deg, ${accent} 0%, ${accentDeep} 100%);`;
const CTA_BG = `background-color:${accent};background-image:linear-gradient(90deg, ${accent} 0%, ${accentDeep} 100%);`;

const TIME_ZONE = "Europe/Berlin";

function formatReceived(date: Date): { long: string; short: string } {
  const long = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
    timeZoneName: "short",
  }).format(date);
  const short = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
  return { long, short };
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || full;
}

/** Mail providers hide the message if the preheader is empty, so give Gmail a real first line. */
function preheader(name: string, message: string): string {
  const oneLine = message.replace(/\s+/g, " ").trim();
  const clipped = oneLine.length > 110 ? `${oneLine.slice(0, 107).trimEnd()}…` : oneLine;
  return `${name}: ${clipped}`;
}

function replyHref(email: string, name: string): string {
  const subject = encodeURIComponent(`Re: your enquiry via ${site.url.replace(/^https?:\/\//, "")}`);
  const body = encodeURIComponent(`Hi ${firstName(name)},\n\nThanks for getting in touch.\n\n`);
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

/** One label/value row in the details card. */
function detailRow(label: string, valueHtml: string, isLast = false): string {
  const border = isLast ? "" : `border-bottom:1px solid ${line};`;
  return `
                <tr>
                  <td width="112" valign="top" style="width:112px;padding:11px 0;${border}font-family:${font};font-size:11.5px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${muted};">${label}</td>
                  <td valign="top" style="padding:11px 0;${border}font-family:${font};font-size:14.5px;line-height:1.5;color:${ink};">${valueHtml}</td>
                </tr>`;
}

export function buildContactNotification(input: ContactNotificationInput): ContactNotification {
  const receivedAt = input.receivedAt ?? new Date();
  const received = formatReceived(receivedAt);
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  const domain = site.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const senderDomain = email.split("@")[1] ?? "";

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const safeDomain = escapeHtml(domain);
  const reply = escapeHtml(replyHref(email, name));
  const year = receivedAt.getFullYear();

  const subject = `New enquiry from ${name} · ${domain}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${canvas};font-family:${font};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(preheader(name, message))}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${canvas}" style="border-collapse:collapse;background-color:${canvas};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="border-collapse:collapse;width:100%;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td bgcolor="${accent}" style="${HEADER_BG}padding:20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="middle">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td width="42" style="width:42px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                            <tr>
                              <td align="center" valign="middle" bgcolor="#ffffff" width="42" height="42"
                                  style="width:42px;height:42px;border-radius:11px;background-color:#ffffff;font-family:${font};font-size:15px;font-weight:700;color:${accentDeep};letter-spacing:-0.02em;">
                                ${escapeHtml(site.initials)}
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="padding-left:14px;">
                          <div style="font-family:${font};font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#EDE8FD;line-height:1.3;">New enquiry</div>
                          <div style="font-family:${font};font-size:16px;font-weight:600;color:#ffffff;line-height:1.35;">Contact form &middot; ${safeDomain}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle" style="font-family:${font};font-size:12.5px;color:#EDE8FD;white-space:nowrap;">${escapeHtml(received.short)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead -->
          <tr>
            <td style="padding:30px 32px 8px 32px;">
              <h1 style="margin:0 0 6px 0;font-family:${font};font-size:22px;line-height:1.3;font-weight:700;color:${ink};letter-spacing:-0.01em;">${safeName} sent you a message</h1>
              <p style="margin:0;font-family:${font};font-size:14px;line-height:1.6;color:${muted};">Submitted through the contact form on ${safeDomain}. Hit <strong style="color:${bodyText};font-weight:600;">Reply</strong> in your mail client — it goes straight to ${safeName}.</p>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:18px 32px 0 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                ${detailRow("From", safeName)}
                ${detailRow("Email", `<a href="mailto:${safeEmail}" style="color:${accentDeep};text-decoration:none;font-weight:500;">${safeEmail}</a>${senderDomain ? `<span style="color:${muted};font-size:13px;"> &nbsp;&middot;&nbsp; ${escapeHtml(senderDomain)}</span>` : ""}`)}
                ${detailRow("Received", escapeHtml(received.long), true)}
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:22px 32px 6px 32px;">
              <div style="font-family:${font};font-size:11.5px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${muted};margin:0 0 10px 0;">Message</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td width="4" bgcolor="${accent}" style="width:4px;background-color:${accent};border-radius:4px 0 0 4px;"></td>
                  <td bgcolor="${accentTint}" style="background-color:${accentTint};padding:18px 22px;border-radius:0 12px 12px 0;font-family:${font};font-size:15.5px;line-height:1.7;color:${ink};">${safeMessage}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="left" style="padding:22px 32px 30px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td bgcolor="${accent}" style="${CTA_BG}border-radius:999px;">
                    <a href="${reply}"
                       style="display:inline-block;padding:13px 30px;font-family:${font};font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                      Reply to ${escapeHtml(firstName(name))}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 32px 24px 32px;border-top:1px solid ${line};">
              <p style="margin:0;font-family:${font};font-size:12px;line-height:1.6;color:${muted};">
                Sent automatically by the contact form at
                <a href="${escapeHtml(site.url)}" target="_blank" rel="noopener noreferrer" style="color:${accentDeep};text-decoration:none;">${safeDomain}</a>.
                The sender's address is set as Reply-To, so a normal reply reaches them directly.
              </p>
              <p style="margin:10px 0 0 0;font-family:${font};font-size:11px;color:${muted};">&copy; ${year} ${escapeHtml(site.name)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `NEW ENQUIRY — ${domain}`,
    "",
    `From:      ${name}`,
    `Email:     ${email}`,
    `Received:  ${received.long}`,
    "",
    "MESSAGE",
    "-------",
    message,
    "",
    "-------",
    `Reply to this email to answer ${firstName(name)} directly (Reply-To is set to their address).`,
    `Sent automatically by the contact form at ${site.url}`,
  ].join("\n");

  return { subject, html, text };
}
