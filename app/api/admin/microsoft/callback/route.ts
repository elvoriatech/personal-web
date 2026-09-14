import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { completeConnection, consumeState, redirectUri } from "@/lib/mail/microsoft";

/** Step 2: Microsoft returns here with a code; exchange it and store the tokens. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const back = (query: string) => redirect(`/admin/email?${query}`);

  // No admin cookie on this host: the sign-in started on the other host
  // (www vs non-www). Say so instead of returning a bare 401.
  if (!(await isSignedIn())) {
    return back(
      "ms_error=" +
        encodeURIComponent(
          `No admin session on ${url.host}. Open the admin on this exact address, sign in, and click Connect again.`
        )
    );
  }

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
