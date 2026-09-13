import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { mailerMode } from "@/lib/campaigns/mailer";
import { PersonalEmailForm } from "./PersonalEmailForm";

export const dynamic = "force-dynamic";

export default async function AdminEmailPage() {
  if (!(await isSignedIn())) redirect("/admin/login");
  const mode = mailerMode();

  return (
    <div>
      <h1 className="font-display text-[24px] font-semibold text-ink">Send an email</h1>
      <p className="mt-1.5 max-w-[70ch] text-[13.5px] text-body">
        A one-off personal email — a job application, an introduction, a reply to a
        lead. It uses the same branded template as campaigns, but without the
        cold-outreach opt-out line, and can attach your résumé and cover letter.
        {mode === "smtp" && " Sending via SMTP from your own mailbox."}
      </p>
      <div className="mt-7">
        <PersonalEmailForm mailReady={mode !== "unconfigured"} />
      </div>
    </div>
  );
}
