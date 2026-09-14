/**
 * Which service carries an outgoing email. Client-safe: the admin forms list
 * these; the server decides what "auto" means at send time.
 */
export type MailTransport = "microsoft" | "resend" | "smtp";
export type TransportChoice = MailTransport | "auto";

export const TRANSPORT_LABELS: Record<MailTransport, string> = {
  microsoft: "Hotmail / Outlook",
  resend: "Resend",
  smtp: "SMTP mailbox",
};

export function coerceTransportChoice(value: unknown): TransportChoice {
  return value === "microsoft" || value === "resend" || value === "smtp" ? value : "auto";
}

/** What the admin pages show: which transports are usable and as whom they send. */
export type MailStatus = {
  available: { id: MailTransport; from: string; note: string }[];
  /** Best default for one-off personal mail (a real mailbox wins). */
  personalDefault: MailTransport | null;
  /** Best default for campaigns (a verified sending service wins). */
  campaignDefault: MailTransport | null;
  microsoft: {
    /** MS_CLIENT_ID / MS_CLIENT_SECRET are set, so "Connect" can work. */
    configured: boolean;
    connected: boolean;
    accountEmail: string;
  };
};
