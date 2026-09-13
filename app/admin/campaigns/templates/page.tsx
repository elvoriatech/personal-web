import Link from "next/link";
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { isCampaignsConfigured } from "@/lib/campaigns/store";
import { CampaignTemplateEditor } from "./CampaignTemplateEditor";

export const dynamic = "force-dynamic";

export default async function CampaignTemplatesPage() {
  if (!(await isSignedIn())) redirect("/admin/login");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[24px] font-semibold text-ink">
          Campaign Templates
        </h1>
        <Link
          href="/admin/campaigns"
          className="inline-flex min-h-[38px] items-center rounded-pill border border-line px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
        >
          Back to campaigns
        </Link>
      </div>
      <p className="mt-1.5 max-w-[70ch] text-[13.5px] text-body">
        The three stages of a sequence. Follow-ups are queued automatically three
        and seven days after the initial send, and stop the moment someone replies.
      </p>
      <div className="mt-7">
        <CampaignTemplateEditor configured={isCampaignsConfigured()} />
      </div>
    </div>
  );
}
