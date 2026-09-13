import Link from "next/link";
import type { Metadata } from "next";
import { isSignedIn } from "@/lib/auth";
import { persistenceMode } from "@/lib/documents/store";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Rendered per request so the session is always re-checked. */
export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/resume", label: "Résumé" },
  { href: "/admin/cover-letter", label: "Cover Letter" },
  { href: "/admin/templates", label: "Outreach Templates" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/email", label: "Send Email" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const signedIn = await isSignedIn();

  // The login page renders its own shell; everything else requires a session.
  if (!signedIn) {
    return <>{children}</>;
  }

  const mode = persistenceMode();

  return (
    <div className="min-h-screen bg-bg-tint">
      <header className="border-b border-line bg-surface">
        <div className="container-site flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-ink">
              Admin
            </span>
            <nav>
              <ul className="flex flex-wrap gap-4">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-block py-2 text-[13px] text-body hover:text-accent-deep"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="min-h-[40px] rounded-pill border border-line px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {mode !== "database" && (
        <div
          className={`border-b px-4 py-2.5 text-center text-[12.5px] ${
            mode === "read-only"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {mode === "read-only" ? (
            <>
              <strong>Saving is disabled.</strong> No <code>DATABASE_URL</code> is set
              and the serverless filesystem is read-only, so edits cannot persist.
              Add a Postgres URL in your Vercel environment variables.
            </>
          ) : (
            <>
              No <code>DATABASE_URL</code> set — edits are being written to{" "}
              <code>.data/documents.json</code> on this machine only.
            </>
          )}
        </div>
      )}

      <main className="container-site py-10">{children}</main>
    </div>
  );
}
