import type { EmailTemplateType } from "./types";

/**
 * Seed copy for the three campaign stages. Placeholders are filled per
 * recipient: {{firstName}}, {{company}}, {{industry}}.
 *
 * Bodies are plain text — they are escaped and converted to HTML at send time,
 * so a template can never inject markup into the email.
 */
export const DEFAULT_TEMPLATES: Record<
  EmailTemplateType,
  { subject: string; bodyHtml: string }
> = {
  initial: {
    subject: "{{company}} — a quick thought on your website",
    bodyHtml: `Hi {{firstName}},

I came across {{company}} and had a look at your site.

I build web, mobile and desktop applications for a living — most recently fleet-telematics software at PTC Telematik and an e-commerce platform at Retromotion. I also built and run Guessto, a multi-tenant restaurant ordering platform, end to end.

If it is useful, I am happy to send a short, free breakdown of what I would improve on {{company}}'s site — performance, mobile, search visibility — and what it would take. No obligation.

Would that be worth a look?

Best regards,
Zahoor Ahmed`,
  },
  follow_up_1: {
    subject: "Re: {{company}} — following up",
    bodyHtml: `Hi {{firstName}},

Following up on my note from a few days ago, in case it arrived at a busy moment.

The short version: I build production web, mobile and desktop applications, and AI features that actually ship. If {{company}} has something planned this quarter, I would be glad to talk it through.

Best regards,
Zahoor Ahmed`,
  },
  follow_up_2: {
    subject: "Re: {{company}} — last note from me",
    bodyHtml: `Hi {{firstName}},

This is my last note — I will not keep filling your inbox.

If {{company}} ever needs a senior engineer for web, mobile, desktop or AI work, my details are below and I would be glad to hear from you.

Thanks for your time either way.

Best regards,
Zahoor Ahmed`,
  },
};
