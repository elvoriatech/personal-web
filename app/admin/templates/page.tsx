import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { canPersist, getDocuments } from "@/lib/documents/store";
import { TemplateEditor } from "./TemplateEditor";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  if (!(await isSignedIn())) redirect("/admin/login");
  const { emailTemplates } = await getDocuments();

  return (
    <div>
      <h1 className="font-display text-[24px] font-semibold text-ink">
        Outreach Templates
      </h1>
      <p className="mt-1.5 max-w-[72ch] text-[13.5px] text-body">
        Email templates for winning project work. Fill the placeholders per
        recipient and copy the result into your mail client.
      </p>
      <p className="mt-3 max-w-[72ch] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.6] text-amber-900">
        <strong>Before you send in bulk:</strong> unsolicited commercial email to
        businesses is restricted in Germany and the EU (UWG §7, GDPR). Keep the
        opt-out line in every template, write to genuine business addresses only,
        personalise each one, and keep volumes low. The database schema records an
        opt-out flag per contact — honour it on every send.
      </p>
      <div className="mt-7">
        <TemplateEditor initial={emailTemplates} canSave={canPersist()} />
      </div>
    </div>
  );
}
