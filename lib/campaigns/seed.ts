import "server-only";

import { DEFAULT_TEMPLATES } from "./defaults";
import { getTemplate, saveTemplate } from "./store";
import { TEMPLATE_TYPES } from "./types";

/** Writes the default copy for any template that does not exist yet. */
export async function seedTemplatesIfMissing(): Promise<number> {
  let created = 0;
  for (const type of TEMPLATE_TYPES) {
    if (await getTemplate(type)) continue;
    await saveTemplate({ templateType: type, ...DEFAULT_TEMPLATES[type] });
    created++;
  }
  return created;
}
