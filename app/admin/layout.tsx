import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/content/site";
import { isSignedIn } from "@/lib/auth";
import { persistenceMode } from "@/lib/documents/store";
import { logout } from "./actions";
import { AdminNav, type NavGroup } from "./_components/AdminNav";
import { MobileAdminNav } from "./_components/MobileAdminNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Rendered per request so the session is always re-checked. */
export const dynamic = "force-dynamic";

const NAV: NavGroup[] = [
  {
    title: "Content",
    items: [
      { href: "/admin", label: "Overview", icon: "home" },
      { href: "/admin/resume", label: "Résumé", icon: "resume" },
      { href: "/admin/cover-letter", label: "Cover letter", icon: "letter" },
      { href: "/admin/blog", label: "Blog", icon: "blog" },
    ],
  },
  {
    title: "Outreach",
    items: [
      { href: "/admin/campaigns", label: "Campaigns", icon: "campaigns" },
      { href: "/admin/templates", label: "Outreach templates", icon: "templates" },
      { href: "/admin/email", label: "Send an email", icon: "send" },
    ],
  },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const signedIn = await isSignedIn();

  // The login page renders its own shell; everything else requires a session.
  if (!signedIn) {
    return <>{children}</>;
  }

  const mode = persistenceMode();

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="accent-gradient inline-flex h-8 w-8 items-center justify-center rounded-[9px] font-display text-[12px] font-bold text-white">
        {site.initials}
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[12.5px] font-semibold uppercase tracking-[0.14em] text-ink">
          Admin
        </span>
        <span className="block text-[11px] text-muted">{site.name}</span>
      </span>
    </Link>
  );

  const signOut = (
    <form action={logout}>
      <button
        type="submit"
        className="flex min-h-[40px] w-full items-center justify-center rounded-pill border border-line px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
      >
        Sign out
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-bg-tint lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      {/* ------------------------------ sidebar ------------------------------ */}
      <aside className="hidden border-r border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:gap-6 lg:px-4 lg:py-5">
        <div className="px-3">{brand}</div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AdminNav groups={NAV} />
        </div>
        <div className="space-y-3 border-t border-line pt-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            className="flex min-h-[40px] items-center justify-between rounded-xl px-3 text-[13px] text-body hover:bg-bg-tint hover:text-ink"
          >
            View the live site
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-muted" aria-hidden="true">
              <path d="M6 3.5h6.5V10M12.5 3.5 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </Link>
          {signOut}
        </div>
      </aside>

      {/* -------------------------------- main -------------------------------- */}
      <div className="min-w-0">
        {/* Compact bar for narrow windows; the sidebar takes over from lg up. */}
        <header className="relative border-b border-line bg-surface lg:hidden">
          <div className="flex min-h-16 items-center justify-between gap-3 px-5 py-2">
            {brand}
            <div className="flex items-center gap-2">
              <MobileAdminNav groups={NAV} />
              <form action={logout}>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-pill border border-line px-3.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
                >
                  Sign out
                </button>
              </form>
            </div>
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

        <main className="mx-auto w-full max-w-[1180px] px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
