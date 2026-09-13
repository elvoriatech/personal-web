import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isSignedIn()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-tint px-5">
      <div className="w-full max-w-[380px] rounded-card border border-line bg-surface p-7">
        <h1 className="font-display text-[20px] font-semibold text-ink">
          Admin sign in
        </h1>
        <p className="mt-1.5 text-[13px] text-body">
          Enter the admin password to edit your documents.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
