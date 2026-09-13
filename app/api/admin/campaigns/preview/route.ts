import { requireAdmin } from "@/lib/campaigns/guard";
import { plainTextToHtml, wrapCampaignEmailHtml } from "@/lib/campaigns/emailLayout";
import { site } from "@/content/site";
import { getTemplate } from "@/lib/campaigns/store";
import { applyTemplateVars } from "@/lib/campaigns/templateVars";
import type { EmailTemplateType } from "@/lib/campaigns/types";

/** Renders a template exactly as it will be sent, for review in the browser. */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const type = (new URL(request.url).searchParams.get("template") ??
    "initial") as EmailTemplateType;

  const template = await getTemplate(type);
  if (!template) return new Response("Template not found", { status: 404 });

  const vars = { firstName: "Alice", companyName: "Example GmbH", industry: "retail" };
  const html = wrapCampaignEmailHtml(
    plainTextToHtml(applyTemplateVars(template.bodyHtml, vars)),
    {
      preheader: applyTemplateVars(template.subject, vars),
      showOptOut: true,
      ctaLabel: "See my work",
      ctaHref: site.url,
    }
  );

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
