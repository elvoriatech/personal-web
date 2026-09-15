import { audiences, discoveryCall, faqs, packages, positioning } from "@/content/business";
import { caseStudies, projects } from "@/content/projects";
import { services } from "@/content/services";
import { careerSummary, site, socials } from "@/content/site";
import { listPosts } from "@/lib/blog/store";

export const revalidate = 3600;

/**
 * /llms.txt — a plain-Markdown summary of the site for AI assistants and
 * search engines that read it (the llmstxt.org convention). Everything here
 * is generated from the same content files as the pages, so it cannot drift.
 */
export async function GET() {
  const posts = await listPosts();
  const lines: string[] = [
    `# ${site.name} — ${positioning.title}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} is a senior software engineer and AI engineer based in ${site.location}, working remotely with clients in Germany, the EU and worldwide in English. ${careerSummary}`,
    "",
    `Website: ${site.url}`,
    `Email: ${site.email}`,
    `Phone: ${site.phone}`,
    ...socials.filter((s) => s.href).map((s) => `${s.label}: ${s.href}`),
    "",
    "## Services",
    "",
    ...services.map((s) => `- **${s.title}** (${site.url}/#${s.id}): ${s.blurb} Deliverables: ${s.deliverables.join("; ")}.`),
    "",
    "## Who the services are for",
    "",
    ...audiences.map((a) => `- **${a.title}**: ${a.body}`),
    "",
    "## Pricing (starting points, EUR)",
    "",
    ...packages.map((p) => `- **${p.name}** — ${p.price}${p.priceNote ? ` ${p.priceNote}` : ""}, ${p.timeline}: ${p.summary}`),
    "",
    `## How to start`,
    "",
    `${discoveryCall.title}: ${discoveryCall.meta}. ${discoveryCall.promise} Contact form: ${site.url}/#contact`,
    "",
    "## Case studies",
    "",
    ...caseStudies.map(
      (p) =>
        `- [${p.name} — ${p.category}](${site.url}/work/${p.slug}): Problem: ${p.caseStudy.problem} Solution: ${p.caseStudy.solution} Outcome: ${p.caseStudy.outcome}`
    ),
    "",
    "## Other projects",
    "",
    ...projects.filter((p) => !p.caseStudy).map((p) => `- ${p.name} (${p.category}, ${p.status}): ${p.blurb}${p.href ? ` ${p.href}` : ""}`),
    "",
    "## Frequently asked questions",
    "",
    ...faqs.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
  ];

  if (posts.length > 0) {
    lines.push("## Blog", "", ...posts.map((post) => `- [${post.title}](${site.url}/blog/${post.slug}) — ${post.excerpt}`), "");
  }

  lines.push("## Optional", "", `- [Sitemap](${site.url}/sitemap.xml)`, `- [Blog index](${site.url}/blog)`, "");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
