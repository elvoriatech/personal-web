import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { mailerMode } from "@/lib/campaigns/mailer";
import { getDocuments } from "@/lib/documents/store";
import { PersonalEmailForm } from "./PersonalEmailForm";

export const dynamic = "force-dynamic";

export default async function AdminEmailPage() {
  if (!(await isSignedIn())) redirect("/admin/login");
  const mode = mailerMode();
  const { resume } = await getDocuments();
  const defaultResume = resume.preferredVariant === "design" ? "resume_design" : "resume_ats";

  return (
    <div>
      <h1 className="font-display text-[24px] font-semibold text-ink">Send an email</h1>
      <p className="mt-1.5 max-w-[70ch] text-[13.5px] text-body">
        A one-off personal email — a job application, an introduction, a reply to a
        lead. Choose the plain-letter or branded look, preview it, and attach your
        résumé or cover letter. Unlike campaigns it carries no opt-out line.
        {mode === "smtp" && " Sending via SMTP from your own mailbox."}
      </p>
      <div className="mt-7">
        <PersonalEmailForm mailReady={mode !== "unconfigured"} defaultAttachment={defaultResume} />
      </div>
    </div>
  );
}
