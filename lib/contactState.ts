/**
 * Shared form state. Kept out of the "use server" module because such files
 * may only export async functions — exporting this object from there throws
 * "A 'use server' file can only export async functions, found object."
 */
export type ContactValues = { name: string; email: string; message: string };

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<keyof ContactValues, string>>;
  /** Echoed back on failure so the visitor never loses what they typed. */
  values?: ContactValues;
};

export const initialContactState: ContactState = { status: "idle", message: "" };
