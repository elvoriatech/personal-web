import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/campaigns/guard";
import {
  attachStateCookie,
  authorizeUrl,
  isMicrosoftConfigured,
  newState,
  redirectUri,
} from "@/lib/mail/microsoft";

/** Step 1 of connecting Hotmail: send the admin to Microsoft's sign-in. */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const origin = new URL(request.url).origin;
  if (!isMicrosoftConfigured()) {
    return NextResponse.redirect(
      `${origin}/admin/email?ms_error=${encodeURIComponent("Set MS_CLIENT_ID and MS_CLIENT_SECRET first.")}`
    );
  }
  const state = newState();
  return attachStateCookie(NextResponse.redirect(authorizeUrl(state, redirectUri(request))), state);
}
