/**
 * Commercial copy: the offer, who it is for, why hire, pricing and FAQ.
 * Everything a prospective client needs to decide to get in touch.
 *
 * Prices are starting points for positioning, not quotes — adjust them here.
 */

export const positioning = {
  /** Short identity used in titles, structured data and the footer. */
  title: "AI Engineer & AI Automation Consultant",
  headline: "I build production-ready AI systems for businesses.",
  lead:
    "I help startups and businesses build AI agents, RAG applications, LLM-powered products and workflow automations — from idea to production.",
  capabilities: ["AI Agents", "RAG", "LLM Applications", "MCP", "Automation", "AWS"],
  question: "Have an AI idea or a process you want to automate?",
} as const;

export const discoveryCall = {
  eyebrow: "Start here",
  title: "Start with an AI discovery call",
  meta: "30 minutes · Free · Remote",
  intro: "Tell me about:",
  topics: [
    "your business and who your customers are",
    "the workflow that eats the most time today",
    "what you would like to automate or build",
    "your AI or product idea, however rough",
  ],
  promise:
    "I will tell you whether I think AI can realistically help, what I would build first, and what it would roughly take. No slides, no obligation.",
  cta: "Book a free consultation",
} as const;

export const audiences = [
  {
    title: "Startups",
    body: "Build your AI MVP without hiring a full engineering team, on foundations that survive your first customers.",
  },
  {
    title: "Small & medium businesses",
    body: "Automate repetitive workflows and internal processes: support triage, document handling, reporting, data entry.",
  },
  {
    title: "Software companies",
    body: "Add experienced AI engineering capacity to your team for a feature, a quarter or a product line.",
  },
  {
    title: "Agencies",
    body: "Deliver AI projects for your clients without building an AI team in-house. White-label welcome.",
  },
] as const;

export const reasons = [
  {
    title: "AI plus serious software engineering",
    body: "The model is the easy part. The retrieval, the tool calling, the evaluation, the deployment and the monitoring around it are what reach users — and that is the work I have done for eight years.",
  },
  {
    title: "Production experience, not demos",
    body: "Fleet telematics, an auto-parts marketplace and an IATA-certified airline platform: systems with real traffic, real money and real on-call.",
  },
  {
    title: "Cloud and delivery included",
    body: "AWS, Kubernetes, GitLab CI/CD and Grafana come with the engagement. You get a system that is deployed and observable, not a notebook.",
  },
  {
    title: "I ship my own products",
    body: "Guessto runs live restaurants today and RankForge AI opens pull requests on real repositories. I know what it takes to get from idea to paying users.",
  },
] as const;

export type Package = {
  name: string;
  price: string;
  /** e.g. "fixed", "from", "per hour" — shown small next to the price. */
  priceNote: string;
  summary: string;
  includes: string[];
  timeline: string;
  highlighted?: boolean;
};

export const packages: Package[] = [
  {
    name: "AI Discovery",
    price: "€250",
    priceNote: "fixed",
    summary: "Business and process analysis plus a technical AI roadmap you can act on, with or without me.",
    includes: [
      "90-minute workshop on your workflows and data",
      "Written roadmap: what to automate first and how",
      "Model, cost and data-privacy recommendation",
    ],
    timeline: "One week",
  },
  {
    name: "AI Prototype",
    price: "from €1,500",
    priceNote: "",
    summary: "A working AI proof-of-concept on your real data, so the decision to invest is made on evidence.",
    includes: [
      "Agent or RAG prototype connected to your data",
      "Evaluation set and quality report",
      "Demo you can share internally",
    ],
    timeline: "1–2 weeks",
    highlighted: true,
  },
  {
    name: "AI MVP",
    price: "from €3,000",
    priceNote: "",
    summary: "AI plus backend, frontend, database and deployment: a product your first users can log in to.",
    includes: [
      "Scoped feature set and release plan",
      "Auth, billing and multi-tenant foundations where needed",
      "Deployed on AWS with monitoring and cost controls",
    ],
    timeline: "4–8 weeks",
  },
  {
    name: "AI Engineering",
    price: "€70+",
    priceNote: "per hour",
    summary: "Ongoing development, integration and technical support as part of your team.",
    includes: [
      "Weekly or monthly capacity",
      "Code review, architecture and pairing",
      "Production support and incident response",
    ],
    timeline: "Flexible",
  },
];

export const pricingNote =
  "Starting points, not quotes. Every engagement begins with the free discovery call, and fixed-price offers follow a written scope.";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

/** Empty until real ones arrive — the section stays hidden rather than showing invented praise. */
export const testimonials: Testimonial[] = [];

export const faqs = [
  {
    q: "What kind of AI projects do you take on?",
    a: "Agents that automate a business workflow, RAG assistants over company documents, LLM features inside existing software, and complete AI products or MVPs. If a task involves unstructured text, documents or decisions that currently need a person to read and route things, it is usually a good fit.",
  },
  {
    q: "How long does an AI prototype take?",
    a: "Typically one to two weeks. A prototype runs on your real data and comes with an evaluation set, so you see actual answer quality before committing to a full build.",
  },
  {
    q: "Which models do you work with?",
    a: "OpenAI, Anthropic Claude, Hugging Face models and self-hosted open-source models through Ollama. The choice follows your data-privacy requirements, latency and cost. EU-hosted and on-premise options are available when data cannot leave your infrastructure.",
  },
  {
    q: "Can you integrate AI into the software we already have?",
    a: "Yes. Most engagements add AI to existing systems through APIs, MCP servers or function calling rather than replacing them. I have worked with Node.js, Python, Java, Angular, React, Vue and PostgreSQL stacks, and with legacy SOAP and REST integrations.",
  },
  {
    q: "What does it cost?",
    a: "Discovery is €250 fixed, a prototype starts at €1,500, an MVP at €3,000, and ongoing engineering from €70 per hour. Every project starts with a free 30-minute call, and fixed-price work follows a written scope.",
  },
  {
    q: "Where are you based, and do you work remotely?",
    a: "I am based near Koblenz, Germany, and work remotely with clients across Germany, the EU and beyond in English. I have delivered production software in Germany, the UAE and Pakistan.",
  },
] as const;
