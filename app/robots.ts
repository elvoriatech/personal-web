import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/** The admin and the document previews should never be indexed. */
const DISALLOW = ["/admin", "/api/", "/resume", "/cover-letter"];

/**
 * AI search and assistant crawlers, allowed explicitly so the site can be
 * cited in ChatGPT, Claude, Perplexity, Gemini and Copilot answers. Listing
 * them by name also guards against a future blanket policy that omits them.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "DuckAssistBot",
  "Amazonbot",
  "meta-externalagent",
  "Bytespider",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
