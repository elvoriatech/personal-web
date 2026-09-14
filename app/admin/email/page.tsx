import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { getMailStatus } from "@/lib/campaigns/mailer";
import { getDocuments } from "@/lib/documents/store";
import { redirectUri } from "@/lib/mail/microsoft";
import { site } from "@/content/site";
import { MailAccountsCard } from "./MailAccountsCard";
import { PersonalEmailForm } from "./PersonalEmailForm";

export const dynamic = "force-dynamic";

export default async function AdminEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ ms_connected?: string; ms_error?: string; ms_disconnected?: string }>;
}) {
  if (!(await isSignedIn())) redirect("/admin/login");
  const params = await searchParams;
  const [mail, { resume }] = await Promise.all([getMailStatus(), getDocuments()]);
  const defaultResume = resume.preferredVariant === "design" ? "resume_design" : "resume_ats";

  const notice = params.ms_error
    ? { tone: "error" as const, text: `Could not connect Hotmail: ${params.ms_error}` }
    : params.ms_connected
      ? { tone: "ok" as const, text: `Connected. Emails can now be sent from ${params.ms_connected}.` }
      : params.ms_disconnected
        ? { tone: "ok" as const, text: "Hotmail disconnected. The stored sign-in was deleted." }
        : null;

  // The callback URL to register in Azure; same rule the OAuth routes use.
  const callback = redirectUri(new Request(`${site.url.replace(/\/$/, "")}/admin/email`));

  return (
    <div>
      <h1 className="font-display text-[24px] font-semibold text-ink">Send an email</h1>
      <p className="mt-1.5 max-w-[70ch] text-[13.5px] text-body">
        A one-off personal email — a job application, an introduction, a reply to a lead.
        Choose the account it leaves from, the plain-letter or branded look, preview it, and
        attach your résumé or cover letter. Unlike campaigns it carries no opt-out line.
      </p>
      <div className="mt-7 space-y-5">
        <MailAccountsCard mail={mail} redirectUri={callback} notice={notice} />
        <PersonalEmailForm mail={mail} defaultAttachment={defaultResume} />
      </div>
    </div>
  );
}
