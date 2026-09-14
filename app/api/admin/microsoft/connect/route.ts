import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/campaigns/guard";
import { authorizeUrl, isMicrosoftConfigured, issueState, redirectUri } from "@/lib/mail/microsoft";

/** Step 1 of connecting Hotmail: send the admin to Microsoft's sign-in. */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isMicrosoftConfigured()) {
    redirect("/admin/email?ms_error=" + encodeURIComponent("Set MS_CLIENT_ID and MS_CLIENT_SECRET first."));
  }
  const state = await issueState();
  redirect(authorizeUrl(state, redirectUri(request)));
}
