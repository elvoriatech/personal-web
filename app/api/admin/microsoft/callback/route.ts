import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/campaigns/guard";
import { completeConnection, consumeState, redirectUri } from "@/lib/mail/microsoft";

/** Step 2: Microsoft returns here with a code; exchange it and store the tokens. */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = new URL(request.url);
  const back = (query: string) => redirect(`/admin/email?${query}`);

  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    return back("ms_error=" + encodeURIComponent(url.searchParams.get("error_description") ?? oauthError));
  }

  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  if (!code || !(await consumeState(state))) {
    return back("ms_error=" + encodeURIComponent("The sign-in did not match this browser session. Please try again."));
  }

  try {
    const { accountEmail } = await completeConnection(code, redirectUri(request));
    return back("ms_connected=" + encodeURIComponent(accountEmail));
  } catch (err) {
    return back("ms_error=" + encodeURIComponent(err instanceof Error ? err.message : "Could not connect."));
  }
}
