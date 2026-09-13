import type { EmailTemplateType } from "./types";

/**
 * Seed copy for the three campaign stages. Placeholders are filled per
 * recipient: {{firstName}}, {{company}}, {{industry}}.
 *
 * Bodies are plain text — they are escaped and converted to HTML at send time,
 * so a template can never inject markup into the email. A blank line starts a
 * new paragraph; lines beginning "- " become a bulleted list.
 *
 * Every claim below is taken from the résumé in content/documents.ts. Do not
 * add metrics or clients that are not there.
 *
 * The sign-off is only "Best regards, Zahoor Ahmed" on purpose: the layout
 * appends the full signature block (title, location, email, phone, website),
 * so repeating it here would print it twice.
 */
export const DEFAULT_TEMPLATES: Record<
  EmailTemplateType,
  { subject: string; bodyHtml: string }
> = {
  initial: {
    subject: "A senior engineer for {{company}}'s next project",
    bodyHtml: `Hi {{firstName}},

I'm Zahoor Ahmed, a senior software engineer based near Koblenz with 8+ years of experience building production web, mobile and desktop applications — and, more recently, AI features that reach production rather than staying a demo.

I'm writing because companies in {{industry}} usually have digital work that never quite reaches the top of the list: a customer portal that needs rebuilding, an internal tool held together by spreadsheets, a mobile app that was promised last year, or an idea for using AI on your own data that nobody has had time to scope.

A few things I have delivered recently:
- Fleet-telematics software at PTC Telematik — Angular and TypeScript applications with NestJS services, running on Kubernetes and AWS
- A microservices e-commerce platform at Retromotion — Elasticsearch product search and automated order synchronisation with Amazon and eBay
- Guessto, a multi-tenant restaurant ordering platform with QR ordering and Stripe payments, which I designed, built and operate end to end
- AI tooling on top of large language models, including RankForge AI, an autonomous SEO engineer that turns its analysis into GitHub pull requests

If {{company}} has something like this on the horizon, I'd like to offer a free 30-minute scoping call: you describe the problem, and I give you a straight answer on architecture, timeline and a realistic budget range. No slide deck and no obligation.

Would a short call in the next two weeks be useful?

Best regards,
Zahoor Ahmed`,
  },
  follow_up_1: {
    subject: "Re: A senior engineer for {{company}}'s next project",
    bodyHtml: `Hi {{firstName}},

A brief follow-up on my note from earlier this week, in case it arrived at a busy moment.

The short version: I help companies like {{company}} ship web, mobile and desktop applications — and AI features built on their own data — with one senior engineer who takes ownership from architecture through to deployment and monitoring.

If there is a project on the horizon, even a loosely defined one, the offer of a free 30-minute scoping call stands. You'll leave it with a clear picture of effort and cost, whether or not we end up working together.

Would that be worth 30 minutes?

Best regards,
Zahoor Ahmed`,
  },
  follow_up_2: {
    subject: "Re: A senior engineer for {{company}}'s next project — closing the loop",
    bodyHtml: `Hi {{firstName}},

I'll keep this brief: it's my last note, and I won't follow up again after this.

If the timing isn't right for {{company}}, that's completely understandable. Should a web, mobile, desktop or AI project come up later, my details are below — you're welcome to get in touch whenever it suits you, and I'll be glad to help.

Thank you for your time.

Best regards,
Zahoor Ahmed`,
  },
};
