import { requireAdmin } from "@/lib/campaigns/guard";
import { DEFAULT_TEMPLATES } from "@/lib/campaigns/defaults";
import { seedTemplatesIfMissing } from "@/lib/campaigns/seed";
import { listTemplates, saveTemplate } from "@/lib/campaigns/store";
import type { EmailTemplateType } from "@/lib/campaigns/types";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await seedTemplatesIfMissing();
    // Defaults ride along so the editor can offer "Restore default" offline.
    return Response.json({ templates: await listTemplates(), defaults: DEFAULT_TEMPLATES });
  } catch (err) {
    return Response.json({ error: message(err) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = (await request.json()) as {
      templateType?: EmailTemplateType;
      subject?: string;
      bodyHtml?: string;
    };
    if (!body.templateType) {
      return Response.json({ error: "templateType is required" }, { status: 400 });
    }
    await saveTemplate({
      templateType: body.templateType,
      subject: body.subject ?? "",
      bodyHtml: body.bodyHtml ?? "",
    });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: message(err) }, { status: 400 });
  }
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : "Unexpected error";
}
