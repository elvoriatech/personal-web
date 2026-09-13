import { resolve4, resolve6, resolveMx } from "node:dns/promises";
import type { DomainStatus } from "./types";

export type DomainCheckReason =
  | "mx"
  | "a_fallback"
  | "syntax"
  | "null_mx"
  | "no_dns_records"
  | "dns_error";

export type DomainCheckResult = {
  domain: string | null;
  status: DomainStatus;
  reason: DomainCheckReason;
};

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/**
 * Classifies an address by DNS so undeliverable ones are never sent to.
 *
 * A transient DNS failure returns 'unknown', never 'invalid' — a timeout must
 * not permanently exclude a real prospect from every future campaign.
 */
export async function checkEmailDomain(email: string): Promise<DomainCheckResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return { domain: null, status: "invalid", reason: "syntax" };
  }
  const domain = trimmed.slice(trimmed.lastIndexOf("@") + 1);

  try {
    const mx = await resolveMx(domain);
    const usable = mx.filter((r) => r.exchange && r.exchange !== ".");
    if (usable.length > 0) return { domain, status: "ok", reason: "mx" };
    // A single "." exchange is RFC 7505 null MX: the domain accepts no mail.
    if (mx.length > 0) return { domain, status: "invalid", reason: "null_mx" };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code ?? "";
    if (code !== "ENOTFOUND" && code !== "ENODATA") {
      return { domain, status: "unknown", reason: "dns_error" };
    }
  }

  // No MX: RFC 5321 says fall back to the A/AAAA record.
  try {
    const [a, aaaa] = await Promise.allSettled([resolve4(domain), resolve6(domain)]);
    const hasA = a.status === "fulfilled" && a.value.length > 0;
    const hasAaaa = aaaa.status === "fulfilled" && aaaa.value.length > 0;
    if (hasA || hasAaaa) return { domain, status: "ok_fallback", reason: "a_fallback" };
    return { domain, status: "invalid", reason: "no_dns_records" };
  } catch {
    return { domain, status: "unknown", reason: "dns_error" };
  }
}
