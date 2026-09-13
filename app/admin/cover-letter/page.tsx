import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { canPersist, getDocuments } from "@/lib/documents/store";
import { CoverLetterEditor } from "./CoverLetterEditor";

export const dynamic = "force-dynamic";

export default async function AdminCoverLetterPage() {
  if (!(await isSignedIn())) redirect("/admin/login");
  const { coverLetter } = await getDocuments();

  return (
    <div>
      <h1 className="font-display text-[24px] font-semibold text-ink">Cover Letter</h1>
      <p className="mt-1.5 max-w-[70ch] text-[13.5px] text-body">
        Set the role and company for the application you are sending, then download.
        Use <code className="text-ink">{"{{role}}"}</code> and{" "}
        <code className="text-ink">{"{{company}}"}</code> anywhere in the body and they
        are filled in automatically.
      </p>
      <div className="mt-7">
        <CoverLetterEditor initial={coverLetter} canSave={canPersist()} />
      </div>
    </div>
  );
}
