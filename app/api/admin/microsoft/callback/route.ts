import { NextResponse } from "next/server";
import { isSignedIn } from "@/lib/auth";
import { completeConnection, consumeState, redirectUri, STATE_COOKIE_NAME } from "@/lib/mail/microsoft";

/** Step 2: Microsoft returns here with a code; exchange it and store the tokens. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const back = (query: string) => {
    const res = NextResponse.redirect(`${url.origin}/admin/email?${query}`);
    res.cookies.delete(STATE_COOKIE_NAME);
    return res;
  };

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
    console.error("[microsoft] sign-in returned an error:", oauthError, url.searchParams.get("error_description"));
    return back("ms_error=" + encodeURIComponent(url.searchParams.get("error_description") ?? oauthError));
  }

  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  if (!code || !(await consumeState(state))) {
    console.error("[microsoft] state check failed", { hasCode: Boolean(code), hasState: Boolean(state) });
    return back(
      "ms_error=" +
        encodeURIComponent("The sign-in did not match this browser session (state cookie missing or stale). Please click Connect again.")
    );
  }

  try {
    const { accountEmail } = await completeConnection(code, redirectUri(request));
    return back("ms_connected=" + encodeURIComponent(accountEmail));
  } catch (err) {
    console.error("[microsoft] token exchange or storage failed:", err);
    return back("ms_error=" + encodeURIComponent(err instanceof Error ? err.message : "Could not connect."));
  }
}
