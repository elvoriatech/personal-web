import type { RecipientStatus } from "@/lib/campaigns/types";

/** JSON fetch that turns HTTP and `{ error }` failures into thrown Errors. */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export type Stats = Record<string, number>;

export type Notice = { tone: "ok" | "error"; text: string } | null;

/** The table's filter chips: every send status, plus the opt-out flag. */
export type RecipientFilter = RecipientStatus | "all" | "opted_out";

export type RecipientQuery = {
  filter: RecipientFilter;
  search: string;
  page: number;
  pageSize: number;
};

export function recipientsUrl(q: RecipientQuery): string {
  const params = new URLSearchParams({
    limit: String(q.pageSize),
    offset: String((q.page - 1) * q.pageSize),
  });
  if (q.filter === "opted_out") params.set("optedOut", "true");
  else if (q.filter !== "all") params.set("status", q.filter);
  if (q.search.trim()) params.set("search", q.search.trim());
  return `/api/admin/campaigns/recipients?${params.toString()}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
