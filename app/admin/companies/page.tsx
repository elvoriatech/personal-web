import Link from "next/link";
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { RECIPIENTS_PAGE_SIZE } from "@/lib/campaigns/constants";
import { isCampaignsConfigured, listRecipients, recipientStats } from "@/lib/campaigns/store";
import type { Recipient } from "@/lib/campaigns/types";
import { CompaniesPanel } from "./CompaniesPanel";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  if (!(await isSignedIn())) redirect("/admin/login");

  const configured = isCampaignsConfigured();
  let page: { rows: Recipient[]; total: number } = { rows: [], total: 0 };
  let stats: Record<string, number> = {};
  let loadError = "";
  if (configured) {
    try {
      [page, stats] = await Promise.all([
        listRecipients({ limit: RECIPIENTS_PAGE_SIZE, offset: 0 }),
        recipientStats(),
      ]);
    } catch (err) {
      // Most likely the schema has not been applied yet (e.g. the website column).
      console.error("[admin] companies load failed:", err);
      loadError = "Could not load companies. Apply lib/db/schema.sql to the database, then reload.";
    }
  }

  return (
    <div>
      <h1 className="font-display text-[24px] font-semibold text-ink">Companies</h1>
      <p className="mt-1.5 max-w-[72ch] text-[13.5px] text-body">
        The businesses you want to work with. Add each one with a contact person, their
        website and an email address — then pick them on any{" "}
        <Link href="/admin/templates" className="font-semibold text-accent-deep underline-offset-2 hover:underline">
          outreach template
        </Link>{" "}
        to preview and send a personalised email.
      </p>
      {loadError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-800">{loadError}</p>
      )}
      <div className="mt-7">
        <CompaniesPanel configured={configured} initialPage={page} initialStats={stats} />
      </div>
    </div>
  );
}
