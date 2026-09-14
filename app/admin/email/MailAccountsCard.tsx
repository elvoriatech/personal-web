import { Card } from "@/components/admin/Fields";
import type { MailStatus } from "@/lib/mail/transports";
import { TRANSPORT_LABELS } from "@/lib/mail/transports";
import { disconnectMicrosoftAction } from "../actions";

/**
 * Server-rendered: which accounts can send, and the Connect / Disconnect
 * controls for Hotmail. `notice` carries the result of an OAuth round-trip.
 */
export function MailAccountsCard({
  mail,
  redirectUris,
  notice,
}: {
  mail: MailStatus;
  redirectUris: string[];
  notice: { tone: "ok" | "error"; text: string } | null;
}) {
  const ms = mail.microsoft;
  return (
    <Card title="Sending accounts">
      {notice && (
        <p
          role="status"
          className={`rounded-xl px-4 py-2.5 text-[13px] ${
            notice.tone === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* ------------------------------ Hotmail ------------------------------ */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-bg-tint/60 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-[13px] font-semibold text-ink">
            Hotmail / Outlook
            <span
              className={`ml-2 rounded-pill px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] ${
                ms.connected ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {ms.connected ? "Connected" : "Not connected"}
            </span>
          </p>
          {ms.connected ? (
            <p className="mt-1 text-[12.5px] leading-[1.6] text-body">
              Sending as <span className="font-medium text-ink">{ms.accountEmail}</span>. Mail goes
              out through your own mailbox, appears in Sent, and replies arrive in the same inbox.
              Microsoft caps personal accounts at roughly 300 recipients a day.
            </p>
          ) : ms.configured ? (
            <p className="mt-1 text-[12.5px] leading-[1.6] text-body">
              Sign in once with your Microsoft account and grant “send mail”. The site keeps a
              refresh token (encrypted) so it never asks again. Passwords are not stored.
            </p>
          ) : (
            <div className="mt-1 space-y-2 text-[12.5px] leading-[1.6] text-body">
              <p>
                Microsoft no longer accepts passwords for SMTP on personal accounts, so this needs a
                one-time app registration (free) in the Azure portal:
              </p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>
                  <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" className="text-accent-deep underline">
                    App registrations
                  </a>{" "}
                  → New registration → name it anything → supported account types: <strong>Personal Microsoft accounts</strong> (or “any org + personal”).
                </li>
                <li>
                  Redirect URIs (platform <strong>Web</strong>) — add <strong>all</strong> of these:
                  <ul className="mt-1 space-y-0.5">
                    {redirectUris.map((u) => (
                      <li key={u}>
                        <code className="rounded bg-bg-tint px-1 break-all">{u}</code>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>Certificates &amp; secrets → New client secret → copy the <strong>value</strong>.</li>
                <li>
                  In Vercel set <code className="rounded bg-bg-tint px-1">MS_CLIENT_ID</code> (Application ID) and{" "}
                  <code className="rounded bg-bg-tint px-1">MS_CLIENT_SECRET</code>, redeploy, then come back and click Connect.
                </li>
              </ol>
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {ms.connected ? (
            <>
              <a
                href="/api/admin/microsoft/connect"
                className="inline-flex min-h-[36px] items-center rounded-pill border border-line bg-surface px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
              >
                Reconnect
              </a>
              <form action={disconnectMicrosoftAction}>
                <button
                  type="submit"
                  className="inline-flex min-h-[36px] items-center rounded-pill border border-red-200 px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-red-700 hover:bg-red-50"
                >
                  Disconnect
                </button>
              </form>
            </>
          ) : (
            <a
              href="/api/admin/microsoft/connect"
              aria-disabled={!ms.configured}
              className={`inline-flex min-h-[36px] items-center rounded-pill border px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] ${
                ms.configured
                  ? "border-accent bg-accent text-white hover:bg-accent-deep"
                  : "pointer-events-none border-line bg-surface text-muted"
              }`}
            >
              Connect Hotmail
            </a>
          )}
        </div>
      </div>

      {/* ------------------------------- others ------------------------------- */}
      <ul className="space-y-2">
        {mail.available
          .filter((t) => t.id !== "microsoft")
          .map((t) => (
            <li key={t.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-line px-4 py-3 text-[12.5px]">
              <span>
                <span className="font-display font-semibold text-ink">{TRANSPORT_LABELS[t.id]}</span>
                <span className="ml-2 text-body">sends as {t.from}</span>
              </span>
              <span className="text-[11.5px] text-muted">{t.note}</span>
            </li>
          ))}
        {mail.available.length === 0 && (
          <li className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-800">
            No sending account yet. Connect Hotmail above, or set <code>RESEND_API_KEY</code>.
          </li>
        )}
      </ul>
    </Card>
  );
}
