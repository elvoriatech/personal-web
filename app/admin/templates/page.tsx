import Link from "next/link";
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import type { PickableCompany } from "@/components/admin/CompanyPicker";
import { getMailStatus } from "@/lib/campaigns/mailer";
import { isCampaignsConfigured, listOutreachSends, listRecipients } from "@/lib/campaigns/store";
import type { Recipient } from "@/lib/campaigns/types";
import { canPersist, getDocuments } from "@/lib/documents/store";
import { TemplateEditor } from "./TemplateEditor";

export const dynamic = "force-dynamic";

/** The picker lists everyone; this says why a company can't be emailed. */
function blockedReason(r: Recipient): string {
  if (r.optedOut) return "Opted out — never email again";
  if (r.status === "bounced") return "Bounced — the mailbox does not exist";
  if (r.domainStatus === "invalid") return "No mail server on this domain";
  return "";
}

export default async function AdminTemplatesPage() {
  if (!(await isSignedIn())) redirect("/admin/login");
  const [{ emailTemplates }, mail] = await Promise.all([getDocuments(), getMailStatus()]);

  let companies: PickableCompany[] = [];
  let sends: Record<string, string> = {};
  if (isCampaignsConfigured()) {
    try {
      const { rows } = await listRecipients({ limit: 1000 });
      companies = rows
        .map((r) => ({
          id: r.id,
          companyName: r.companyName,
          contactName: r.contactName,
          email: r.email,
          website: r.website,
          industry: r.industry,
          blocked: blockedReason(r),
        }))
        .sort((a, b) => (a.companyName || a.email).localeCompare(b.companyName || b.email));
      const log = await listOutreachSends(rows.map((r) => r.id));
      sends = Object.fromEntries(log.map((s) => [`${s.recipientId}:${s.templateId}`, s.sentAt]));
    } catch (err) {
      // A missing column must not take the editor down; sending just isn't offered.
      console.error("[admin] templates: companies load failed:", err);
    }
  }

  return (
    <div>
      <h1 className="font-display text-[24px] font-semibold text-ink">
        Outreach Templates
      </h1>
      <p className="mt-1.5 max-w-[72ch] text-[13.5px] text-body">
        Email templates for winning project work. On any template, pick a company from{" "}
        <Link href="/admin/companies" className="font-semibold text-accent-deep underline-offset-2 hover:underline">
          your list
        </Link>
        , fill in anything specific to them, check the preview, and send. The preview shows exactly
        what they will receive.
      </p>
      <p className="mt-3 max-w-[72ch] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.6] text-amber-900">
        <strong>Before you send:</strong> unsolicited commercial email to
        businesses is restricted in Germany and the EU (UWG §7, GDPR). Every email sent from here
        carries an opt-out line, and opted-out or bounced companies cannot be selected. Write to
        genuine business addresses only, personalise each one, and keep volumes low.
      </p>
      <div className="mt-7">
        <TemplateEditor
          initial={emailTemplates}
          canSave={canPersist()}
          companies={companies}
          initialSends={sends}
          mail={mail}
        />
      </div>
    </div>
  );
}
