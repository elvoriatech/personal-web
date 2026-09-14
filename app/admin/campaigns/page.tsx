import Link from "next/link";
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { RECIPIENTS_PAGE_SIZE } from "@/lib/campaigns/constants";
import { getActiveSendJob } from "@/lib/campaigns/jobs";
import { getMailStatus } from "@/lib/campaigns/mailer";
import { seedTemplatesIfMissing } from "@/lib/campaigns/seed";
import {
  isCampaignsConfigured,
  listRecipients,
  listTemplates,
  recipientStats,
} from "@/lib/campaigns/store";
import type { CampaignTemplate, Recipient, SendJob } from "@/lib/campaigns/types";
import { CampaignsPanel } from "./CampaignsPanel";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  if (!(await isSignedIn())) redirect("/admin/login");

  const configured = isCampaignsConfigured();
  const mail = await getMailStatus();

  // Loaded here rather than in a mount effect, so the first paint already has
  // the data and React is not asked to cascade a render on mount.
  let page: { rows: Recipient[]; total: number } = { rows: [], total: 0 };
  let stats: Record<string, number> = {};
  let job: SendJob | null = null;
  let templates: CampaignTemplate[] = [];
  if (configured) {
    try {
      await seedTemplatesIfMissing();
      const [p, s, j, t] = await Promise.all([
        listRecipients({ limit: RECIPIENTS_PAGE_SIZE, offset: 0 }),
        recipientStats(),
        getActiveSendJob(),
        listTemplates(),
      ]);
      page = p;
      stats = s;
      job = j;
      templates = t;
    } catch (err) {
      // A missing schema must not blank the page; the panel shows the error.
      console.error("[admin] campaigns load failed:", err);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[24px] font-semibold text-ink">Campaigns</h1>
        <Link
          href="/admin/campaigns/templates"
          className="inline-flex min-h-[38px] items-center rounded-pill border border-line px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
        >
          Edit email templates
        </Link>
      </div>
      <p className="mt-1.5 max-w-[72ch] text-[13.5px] text-body">
        Add the companies you want to reach, check their domains, pick an email and a look,
        then send in batches. Sending is throttled and resumable — progress is stored per
        recipient, so a timeout never double-sends.
      </p>

      {mail.available.length === 0 && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-800">
          No sending account yet. Connect Hotmail under <Link href="/admin/email" className="underline">Send an email</Link>,
          or set <code>RESEND_API_KEY</code> with a verified domain.
        </p>
      )}

      <p className="mt-3 max-w-[72ch] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.6] text-amber-900">
        <strong>Before you send:</strong> unsolicited commercial email to businesses
        is restricted in Germany and the EU (UWG §7, GDPR). Every campaign email
        carries an opt-out line, and opted-out addresses are permanently excluded.
        Write to genuine business addresses, keep volumes low, and personalise —
        a reply is worth more than a hundred sends.
      </p>

      <div className="mt-7">
        <CampaignsPanel
          configured={configured}
          initialPage={page}
          initialStats={stats}
          initialJob={job}
          templates={templates}
          mail={mail}
        />
      </div>
    </div>
  );
}
