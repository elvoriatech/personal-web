import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin and the document previews should never be indexed.
      disallow: ["/admin", "/api/", "/resume", "/cover-letter"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
