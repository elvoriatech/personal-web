/**
 * Bing's file-based ownership check. Serves the same token as the
 * msvalidate.01 meta tag, so whichever method is chosen in Webmaster Tools
 * succeeds. 404 when no token is configured, so nothing misleading is served.
 */
export function GET() {
  const token = process.env.BING_SITE_VERIFICATION?.trim();
  if (!token) return new Response("Not found", { status: 404 });

  const xml = `<?xml version="1.0"?>\n<users>\n  <user>${token.replace(/[<&>]/g, "")}</user>\n</users>\n`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
