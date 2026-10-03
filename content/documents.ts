import type { DocumentBundle } from "@/lib/documents/types";

/**
 * Seed content for the résumé, cover letter and outreach templates.
 *
 * These are the DEFAULTS. Once a database is configured the admin panel stores
 * an edited copy and that takes precedence; with no database the site falls
 * back to exactly what is below.
 *
 * Deliberately ATS-safe: no tables, no columns, no images, no glyph bullets —
 * the original Word résumé used 11 tables and 2 embedded images, which is what
 * applicant tracking systems fail to parse.
 */
export const defaultDocuments: DocumentBundle = {
  resume: {
    fullName: "Zahoor Ahmed",
    headline: "Senior Full-Stack Engineer | TypeScript, Angular, NestJS, AWS | LLM applications",
    location: "Mülheim-Kärlich (Koblenz), Germany",
    phone: "+49 162 3363430",
    email: "zahoor_ahmed143@hotmail.com",
    extras: "Permanent Residency | German B1",
    // Recruiters look for both. Fill these in and they appear automatically;
    // left blank they are omitted rather than printed as dead labels.
    linkedin: "linkedin.com/in/zahoor-ahmed-3414a79b",
    github: "github.com/zwebapps",
    preferredVariant: "ats",
    photoShape: "square",
    /*
     * Written to read like a person describing their own work: what the thing
     * was and who used it, plain verbs, no "scalable / high-performance /
     * production-ready" filler, and no invented numbers.
     */
    summary:
      "Full-stack engineer, building web software since 2016, mostly in TypeScript. I work on fleet-telematics apps at PTC Telematik (Angular, NestJS, PostgreSQL, Kubernetes on AWS). Before that I built an auto-parts marketplace in Stuttgart and worked on an airline booking platform in Dubai. In the last year I've been building LLM products in my own time; one crawls websites and opens SEO fixes as GitHub pull requests.",
    skills: [
      { label: "Languages", items: "TypeScript, JavaScript, Python, Java, PHP" },
      { label: "Frontend", items: "Angular, React, Vue / Nuxt, Next.js, NgRx, Redux" },
      {
        label: "Backend",
        items: "Node.js, NestJS, FastAPI, Spring Boot, REST, GraphQL, PostgreSQL, MongoDB, Elasticsearch, CouchDB, Redis",
      },
      { label: "Cloud", items: "AWS (Lambda, API Gateway, ECS, S3, CloudFormation), Docker, Kubernetes, GitLab CI, Grafana" },
      { label: "AI", items: "OpenAI and Claude APIs, LangChain, LangGraph, RAG, vector search, Ollama" },
      { label: "Testing", items: "Jest, Playwright, test-driven development" },
    ],
    roles: [
      {
        title: "Senior Software Engineer",
        company: "PTC Telematik GmbH",
        location: "Koblenz, Germany",
        start: "December 2024",
        end: "Present",
        bullets: [
          "Build the Angular 19 web app fleet operators use to manage their vehicles, written test-first with Jest and Playwright.",
          "Write the NestJS services and PostgreSQL schema behind it.",
          "Run the services on Kubernetes and maintain the GitLab CI pipelines and Grafana monitoring.",
          "Work on tracking and analysing live vehicle data.",
        ],
      },
      {
        title: "Full Stack Developer",
        company: "Retromotion GmbH",
        location: "Stuttgart, Germany",
        start: "December 2022",
        end: "August 2024",
        bullets: [
          "Built the shop, admin panel and fulfilment services for an auto-parts marketplace in Node.js, Vue / Nuxt and TypeScript.",
          "Automated order sync with Amazon, eBay and Tyre24 using the Amazon Seller API and scheduled jobs.",
          "Brought product data from TecDoc and several suppliers into one catalogue that fed every marketplace.",
          "Wrote an automatic address check against DHL's APIs, which cut manual support work.",
          "Built \"Cockpit\", a live dashboard for the team, with import and export.",
        ],
      },
      {
        title: "Software Engineer",
        company: "TPConnects Technologies",
        location: "Dubai, UAE",
        start: "October 2019",
        end: "October 2022",
        bullets: [
          "Worked on an airline booking platform in Angular, React and Node.js, from flight search through payment and changes after booking.",
          "Integrated Stripe and EasyPay, voucher generation and flight-supplier systems, with the supplier side in Java Spring.",
          "Handled authentication and security: JWT, OAuth 2.0, sessions.",
          "Deployed on AWS (Lambda, API Gateway, ECS, CloudFormation) with Jest and Playwright tests in GitLab CI.",
        ],
      },
      {
        title: "Full Stack Developer",
        company: "Diwan Arabia Dubai LLC",
        location: "Dubai, UAE",
        start: "September 2018",
        end: "August 2019",
        bullets: [
          "Built Node.js and MongoDB APIs with JWT and role-based access, and React / Redux front ends.",
          "Integrated payment gateways and Google Maps.",
        ],
      },
      {
        title: "Web Developer",
        company: "Jinnah Software House",
        location: "Jhelum, Pakistan",
        start: "January 2017",
        end: "August 2018",
        bullets: ["Built PHP websites and booking and order systems for clients, with PayPal and Stripe payments."],
      },
    ],
    /**
     * Own work, in development or live. Add a real result (users, pages
     * crawled, PRs merged) as soon as there is one — invented numbers are the
     * fastest way to lose an interview, so none are stated here.
     */
    aiProjects: [
      {
        name: "RankForge AI (in development)",
        role: "Own project",
        bullets: [
          "Crawls a website, uses LLM agents to find SEO problems, and opens the fixes as GitHub pull requests.",
          "TypeScript, Playwright crawler, BullMQ workers, PostgreSQL; models through Ollama and OpenRouter.",
        ],
      },
      {
        name: "DeutschFlow AI (in development)",
        role: "Own project",
        bullets: ["A German tutor that answers from graded learning material, using RAG with LangChain."],
      },
    ],
    projects: [
      {
        name: "Guessto",
        url: "guessto.com",
        summary:
          "Live restaurant ordering platform. Each restaurant gets its own subdomain, with QR ordering and Stripe payments.",
      },
      {
        name: "DUDI",
        url: "dudiapp.com",
        summary: "Sports community app on web, iOS and Android.",
      },
      {
        name: "UniKoop",
        url: "unikoop.nl",
        summary: "Dutch home-shopping shop with catalogue and checkout.",
      },
    ],
    education: [
      {
        qualification: "B.Eng. Software Engineering",
        institution: "Virtual University of Pakistan",
        period: "2014 - 2018",
      },
    ],
    certifications: [
      {
        qualification: "Associate AI Engineer for Developers",
        institution: "DataCamp",
        period: "2026",
      },
      {
        qualification: "AI Engineering Programme",
        institution: "Turing College",
        period: "2026",
        detail: "RAG with LangChain, LLM agents with LangGraph, prompt evaluation.",
      },
    ],
    languages: "English (professional working proficiency), German (B1)",
  },

  coverLetter: {
    fullName: "Zahoor Ahmed",
    headline: "Senior Software Engineer | AI Engineer",
    location: "Mülheim-Kärlich, Germany",
    phone: "+49 162 3363430",
    email: "zahoor_ahmed143@hotmail.com",
    targetRole: "",
    targetCompany: "",
    greeting: "Dear Hiring Manager,",
    paragraphs: [
      "I am writing to express my interest in the {{role}} position at {{company}}. With 8+ years of experience building enterprise-grade software across telematics, e-commerce and airline technology, combined with my recent specialisation in Applied AI Engineering, I bring software architecture expertise, cloud engineering experience and practical AI development skills.",
      "Throughout my career I have designed and delivered scalable applications and microservices using TypeScript, Node.js, NestJS, Angular, React, Python, Java, PostgreSQL and AWS. In my current role at PTC Telematik GmbH I work on fleet-telematics solutions, developing Angular and TypeScript applications, NestJS backend services, Kubernetes-based microservices, AWS serverless infrastructure and real-time vehicle tracking services. I am also responsible for CI/CD, observability, scalability and production reliability.",
      "My recent focus has shifted toward AI Engineering and LLM-powered applications. I have hands-on expertise in RAG architectures, vector-based retrieval, LangChain, LangGraph, LangSmith, AI agents, prompt engineering, and foundation models such as OpenAI and Claude. I am particularly interested in applying these technologies to real business problems while maintaining the engineering principles production systems demand: reliability, security, observability, scalability and maintainability. I completed the Associate AI Engineer for Developers certification through Datacamp and the AI Engineering programme at Turing College.",
      "I also bring substantial experience with AWS, Docker, Kubernetes, GitLab CI/CD, PostgreSQL, MongoDB, Elasticsearch, Redis, REST APIs and GraphQL. My previous work includes architecting a microservices-based automotive e-commerce platform, integrating Amazon and eBay APIs, building airline flight-booking platforms, integrating GDS and airline suppliers, and developing AWS-based systems for high-volume production environments.",
      "What motivates me is combining an established software engineering background with emerging AI technologies. I enjoy taking an idea from architecture and prototyping through implementation, testing, deployment and continuous improvement. That combination of backend engineering, cloud architecture, frontend experience and applied AI lets me contribute quickly to teams building intelligent, scalable products.",
      "I am based in Germany, hold permanent residency and have German at B1 level. I would welcome the opportunity to discuss how my experience could contribute to your team.",
    ],
    closing:
      "Thank you for your time and consideration. I look forward to hearing from you.",
  },

  /**
   * Outreach templates for winning project work.
   *
   * Placeholders are filled per recipient: {{firstName}}, {{company}},
   * {{observation}}, {{senderName}}, {{portfolioUrl}}, {{calendarUrl}}.
   *
   * Note on compliance: unsolicited commercial email to businesses is
   * restricted in Germany and the wider EU (UWG §7 / GDPR). Every template
   * therefore identifies the sender, gives a concrete reason for the contact,
   * and closes with an opt-out line. Keep the opt-out in place, send to
   * genuine business addresses only, and keep volumes low and personalised.
   */
  emailTemplates: [
    {
      id: "website-rebuild",
      name: "Cold outreach — website rebuild",
      purpose:
        "First contact with a business whose site is dated, slow or not mobile-friendly.",
      subject: "{{company}}'s site on mobile — quick observation",
      body: `Hi {{firstName}},

I came across {{company}} while looking at businesses in the area, and noticed {{observation}}.

I build websites and web applications for a living — most recently fleet-telematics software at PTC Telematik and an e-commerce platform at Retromotion. I also run Guessto, a restaurant ordering platform I built end to end.

If it is useful, I am happy to send a short, free breakdown of what I would change on {{company}}'s site and what it would take. No obligation, and no follow-up if the timing is wrong.

Would that be worth a look?

Best regards,
{{senderName}}
{{portfolioUrl}}

If you would rather not hear from me again, just reply "no thanks" and I will not contact you further.`,
    },
    {
      id: "ai-automation",
      name: "Cold outreach — AI and automation",
      purpose:
        "For businesses with a manual, repetitive process an LLM workflow could absorb.",
      subject: "Automating {{observation}} at {{company}}",
      body: `Hi {{firstName}},

I work as a Senior Software Engineer specialising in Applied AI — retrieval systems, agent workflows and LLM features that hold up in production rather than in a demo.

I noticed {{observation}}. That is usually the kind of work a well-scoped AI workflow removes almost entirely: document handling, support triage, data extraction, internal search over your own material.

I have built exactly this — including RankForge AI, which crawls a site, analyses it with LLM agents and opens the fixes as pull requests.

If you are curious, I would be glad to spend 20 minutes mapping which parts of that process are worth automating and which honestly are not. Free, and useful either way.

Best regards,
{{senderName}}
{{portfolioUrl}}

Prefer not to receive these? Reply "no thanks" and I will remove you immediately.`,
    },
    {
      id: "follow-up",
      name: "Follow-up — no reply",
      purpose: "One polite follow-up, sent 5–7 days after the first email. Send only once.",
      subject: "Re: {{company}} — following up once",
      body: `Hi {{firstName}},

Following up once on my note from last week, in case it arrived at a busy moment.

The short version: I build web, mobile and desktop applications, and AI features that reach production. If {{company}} has something planned this quarter, I would be glad to talk. If not, I will leave it there and you will not hear from me again.

Either way, thanks for your time.

Best regards,
{{senderName}}
{{portfolioUrl}}`,
    },
    {
      id: "project-application",
      name: "Reply to a posted project",
      purpose: "Responding to a job board, RFP or freelance listing.",
      subject: "{{role}} — Zahoor Ahmed, Senior Software Engineer",
      body: `Hi {{firstName}},

I am writing about the {{role}} listing at {{company}}.

The most relevant parts of my background:

- 8+ years building production software across fleet telematics, e-commerce and airline platforms.
- Current stack: TypeScript, Angular, React and Next.js on the front end; Node.js, NestJS, FastAPI and Python behind it; AWS and Kubernetes underneath.
- Applied AI: RAG pipelines, LangChain and LangGraph agent workflows, vector stores including Chroma and Neo4j.
- Based in Germany with permanent residency and German at B1.

Recent work worth a look: {{portfolioUrl}}

I have attached my CV. Happy to walk through any part of it, or to take a short technical exercise if that is how you prefer to assess.

Best regards,
{{senderName}}
{{phone}}`,
    },
    {
      id: "referral",
      name: "Warm introduction request",
      purpose: "Asking an existing contact to refer you. Highest conversion of the set.",
      subject: "Quick favour — introduction at {{company}}?",
      body: `Hi {{firstName}},

Hope things are going well at {{company}}.

I am taking on new project work at the moment — web and mobile applications, and increasingly AI features for teams that want them built properly rather than bolted on.

If anyone in your network is looking for that kind of help, I would be grateful for an introduction. And if it is easier, here is a line you can forward:

"Zahoor is a senior engineer in Germany with 8+ years across telematics, e-commerce and airline platforms. He builds web, mobile and desktop applications and production AI systems. Portfolio: {{portfolioUrl}}"

No pressure at all — and let me know if I can return the favour.

Best regards,
{{senderName}}`,
    },
    {
      id: "post-call",
      name: "After a call — scope and next step",
      purpose: "Sent within 24 hours of a first call, while the conversation is fresh.",
      subject: "{{company}} — summary and suggested next step",
      body: `Hi {{firstName}},

Thanks for the time today. Writing down what I understood, so we are working from the same page:

What you want to achieve:
- {{observation}}

What I would suggest:
- A short discovery phase to pin down scope and the data model.
- A first working slice you can use, rather than a long build with nothing to see.
- Then iterate, with a fixed price per stage so there are no surprises.

I will send a written proposal with timings and cost by {{deadline}}.

If anything above is wrong, tell me now rather than later — it is much cheaper to fix at this stage.

Best regards,
{{senderName}}
{{phone}}`,
    },
  ],
};
