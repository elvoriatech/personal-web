import Link from "next/link";
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isSignedIn()) redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg-tint px-5 py-10">
      <div className="w-full max-w-[380px] rounded-card border border-line bg-surface p-7">
        <h1 className="font-display text-[20px] font-semibold text-ink">
          Admin sign in
        </h1>
        <p className="mt-1.5 text-[13px] text-body">
          Enter the admin password to edit your documents.
        </p>
        <LoginForm />
      </div>
      <Link
        href="/"
        className="inline-flex min-h-[40px] items-center gap-1.5 text-[13px] text-body hover:text-accent-deep"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
          <path d="M13.5 8h-11M6.5 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to the website
      </Link>
    </div>
  );
}
