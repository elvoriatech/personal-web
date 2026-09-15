/**
 * Shared form state. Kept out of the "use server" module because such files
 * may only export async functions — exporting this object from there throws
 * "A 'use server' file can only export async functions, found object."
 */
export const BUDGET_OPTIONS = [
  { value: "under-1k", label: "Under €1,000" },
  { value: "1k-3k", label: "€1,000 – €3,000" },
  { value: "3k-10k", label: "€3,000 – €10,000" },
  { value: "10k-plus", label: "€10,000+" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export type BudgetValue = (typeof BUDGET_OPTIONS)[number]["value"];

export function budgetLabel(value: string): string {
  return BUDGET_OPTIONS.find((o) => o.value === value)?.label ?? "Not stated";
}

export type ContactValues = {
  name: string;
  email: string;
  company: string;
  message: string;
  budget: string;
};

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<keyof ContactValues, string>>;
  /** Echoed back on failure so the visitor never loses what they typed. */
  values?: ContactValues;
};

export const initialContactState: ContactState = { status: "idle", message: "" };
