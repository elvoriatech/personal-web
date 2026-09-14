import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { canPersist, getDocuments } from "@/lib/documents/store";
import { ResumeEditor } from "./ResumeEditor";

export const dynamic = "force-dynamic";

export default async function AdminResumePage() {
  if (!(await isSignedIn())) redirect("/admin/login");
  const { resume } = await getDocuments();

  return (
    <div>
      <h1 className="font-display text-[24px] font-semibold text-ink">Résumé</h1>
      <p className="mt-1.5 max-w-[70ch] text-[13.5px] text-body">
        All three themes come from this content — Classic, Modern with your photo,
        and the one-page Compact. Where you can, add real numbers to the
        bullets (services managed, volume handled, time saved); measurable results
        are the single biggest weakness recruiters flag.
      </p>
      <div className="mt-7">
        <ResumeEditor initial={resume} canSave={canPersist()} />
      </div>
    </div>
  );
}
