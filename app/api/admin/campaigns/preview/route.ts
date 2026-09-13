import { requireAdmin } from "@/lib/campaigns/guard";
import { plainTextToHtml, wrapCampaignEmailHtml } from "@/lib/campaigns/emailLayout";
import { getTemplate } from "@/lib/campaigns/store";
import { seedTemplatesIfMissing } from "@/lib/campaigns/seed";
import { applyTemplateVars } from "@/lib/campaigns/templateVars";
import { coerceEmailTheme, DEFAULT_CAMPAIGN_THEME, type EmailTheme } from "@/lib/campaigns/themes";
import { TEMPLATE_TYPES, type EmailTemplateType } from "@/lib/campaigns/types";

const SAMPLE_VARS = { firstName: "Lena", companyName: "Nordlicht Logistik GmbH", industry: "logistics" };

/**
 * Renders a template exactly as it will be sent — same layout call, same
 * options — so what the admin approves in the preview is what goes out.
 *
 *   GET  /api/admin/campaigns/preview?template=initial&theme=plain
 *   POST { subject, bodyHtml, theme }   — preview unsaved edits from the editor
 */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = new URL(request.url);
  const type = url.searchParams.get("template") ?? "initial";
  if (!TEMPLATE_TYPES.includes(type as EmailTemplateType)) {
    return new Response("Unknown template", { status: 400 });
  }
  const theme = coerceEmailTheme(url.searchParams.get("theme"), DEFAULT_CAMPAIGN_THEME);

  await seedTemplatesIfMissing();
  const template = await getTemplate(type as EmailTemplateType);
  if (!template) return new Response("Template not found", { status: 404 });

  return html(render(template.subject, template.bodyHtml, theme));
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as {
    subject?: string;
    bodyHtml?: string;
    theme?: string;
    /** Personal emails have no opt-out line; campaigns always do. */
    showOptOut?: boolean;
  };
  const theme = coerceEmailTheme(body.theme, DEFAULT_CAMPAIGN_THEME);
  return html(render(body.subject ?? "", body.bodyHtml ?? "", theme, body.showOptOut ?? true));
}

function render(subject: string, bodyText: string, theme: EmailTheme, showOptOut = true): string {
  return wrapCampaignEmailHtml(plainTextToHtml(applyTemplateVars(bodyText, SAMPLE_VARS)), {
    preheader: applyTemplateVars(subject, SAMPLE_VARS),
    showOptOut,
    theme,
  });
}

function html(markup: string): Response {
  return new Response(markup, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Rendered into a same-origin <iframe> in the admin; never cache or
      // allow embedding elsewhere.
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
