export type TemplateVars = {
  firstName: string;
  companyName: string;
  industry: string;
};

export function recipientToVars(r: {
  contactName: string;
  companyName: string;
  industry: string;
}): TemplateVars {
  const first = r.contactName.trim().split(/\s+/)[0] || "there";
  return {
    firstName: first,
    companyName: r.companyName.trim() || "your company",
    industry: r.industry.trim() || "your industry",
  };
}

/** Supports both {{firstName}} and the [First Name] style used in the old system. */
export function applyTemplateVars(text: string, vars: TemplateVars): string {
  return text
    .replace(/\{\{\s*firstName\s*\}\}/gi, vars.firstName)
    .replace(/\{\{\s*companyName\s*\}\}/gi, vars.companyName)
    .replace(/\{\{\s*company\s*\}\}/gi, vars.companyName)
    .replace(/\{\{\s*industry\s*\}\}/gi, vars.industry)
    .replace(/\[First Name\]/gi, vars.firstName)
    .replace(/\[Company Name\]/gi, vars.companyName)
    .replace(/\[Industry\]/gi, vars.industry);
}
