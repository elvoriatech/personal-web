export type CaseStudy = {
  /** One line a business owner recognises as their own problem. */
  problem: string;
  solution: string;
  /** Left-to-right data flow, rendered as a chain. */
  architecture: string[];
  /** What the work achieved. Never a number that is not in the CV. */
  outcome: string;
  /** Why this matters to someone hiring today. */
  relevance: string;
  /** Short role statement, e.g. "Own product" or "Full-stack developer, 2022–2024". */
  role: string;
};

export type Project = {
  name: string;
  /** URL segment for /work/[slug]. */
  slug: string;
  category: string;
  /** Where the work sits: own product, or the company it was built at. */
  context?: string;
  blurb: string;
  stack: string[];
  href: string;   // empty = card renders without an outbound link
  image: string;  // empty = designed gradient placeholder is used
  status: "live" | "building" | "offline";
  tint: [string, string];
  featured: boolean;
  /** Present for the projects that get a full page at /work/[slug]. */
  caseStudy?: CaseStudy;
};

/**
 * Screenshots in /public/projects were captured from the live sites with
 * `scripts/capture-screenshots.mjs` (re-run it to refresh them).
 *
 * Projects without a public deployment intentionally have no `image` and fall
 * back to a designed gradient card, with a "In development" badge, rather than
 * showing a mock-up that implies a site that isn't there.
 */
export const projects: Project[] = [
  {
    name: "Guessto",
    slug: "guessto",
    category: "Multi-Tenant SaaS Platform",
    context: "Own product",
    blurb:
      "Restaurant discovery and ordering platform. Every venue gets its own subdomain and menu off a single codebase, with QR ordering, Stripe payments and transactional email built in.",
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
    href: "https://guessto.com",
    image: "/projects/guessto.jpg",
    status: "live",
    tint: ["#1B1B2F", "#3B3468"],
    featured: true,
    caseStudy: {
      role: "Own product — architecture to production",
      problem:
        "Independent restaurants want their own website, digital menu, ordering and card payments, but cannot pay for a bespoke build and a developer per venue.",
      solution:
        "A multi-tenant SaaS: every venue gets its own subdomain, menu, allergen and diet filters, QR-code ordering, Stripe payments and transactional email — all served from one codebase and one deployment.",
      architecture: [
        "Venue subdomain",
        "Tenant resolution",
        "Next.js app",
        "PostgreSQL (tenant-scoped)",
        "Stripe payments",
        "Transactional email",
      ],
      outcome:
        "Live and taking orders. MJ Carros Koblenz runs its full digital menu and direct ordering on the platform today, and new venues onboard without new code.",
      relevance:
        "Proof that I can build a complete SaaS product — auth, billing, multi-tenancy and deployment — not only the AI layer. This is the foundation I reuse for AI MVPs.",
    },
  },
  {
    name: "RankForge AI",
    slug: "rankforge-ai",
    category: "Autonomous SEO Engineering",
    context: "Own product",
    blurb:
      "An AI SEO engineer that crawls a site, analyses it with LLM agents, generates fixes and opens them as GitHub pull requests — then tracks rankings to close the loop.",
    stack: ["LangChain", "Playwright", "Fastify", "BullMQ", "Prisma"],
    href: "",
    image: "",
    status: "building",
    tint: ["#221E45", "#5B49B8"],
    featured: true,
    caseStudy: {
      role: "Own product — in development",
      problem:
        "SEO teams spend hours finding technical issues by hand, then write tickets and wait for developers — and rarely learn whether a fix moved anything.",
      solution:
        "An autonomous AI SEO engineer. It crawls the site, analyses pages with LLM agents, generates the code changes, opens them as GitHub pull requests for review and tracks rankings afterwards to close the loop.",
      architecture: [
        "Playwright crawler",
        "LLM analysis agents",
        "Tool calling",
        "Fix generation",
        "GitHub pull request",
        "Ranking monitor",
      ],
      outcome:
        "Automates the full workflow from discovery to recommendation, implementation and measurement, with a human approving every pull request. Built on LangChain, Fastify, BullMQ job queues and Prisma.",
      relevance:
        "The pattern most businesses need from AI: agents that use tools, act inside existing systems and stay reviewable — applied here to code, but the same architecture drives support, operations and document workflows.",
    },
  },
  {
    name: "Retromotion",
    slug: "retromotion",
    category: "E-Commerce Platform",
    context: "Retromotion GmbH",
    blurb:
      "Microservices auto-parts marketplace with Elasticsearch product search, a real-time admin dashboard and automated Amazon, eBay and Tyre24 order synchronisation.",
    stack: ["Vue.js", "Node.js", "TypeScript", "Elasticsearch"],
    href: "https://retromotion.com",
    image: "/projects/retromotion.jpg",
    status: "live",
    tint: ["#2A2118", "#6B4B2A"],
    featured: true,
    caseStudy: {
      role: "Full-stack developer, Retromotion GmbH, 2022–2024",
      problem:
        "An auto-parts retailer selling through its own shop plus Amazon, eBay and Tyre24 needed one place to manage a large catalogue, search it fast and keep orders from every channel in sync without manual re-keying.",
      solution:
        "A microservices marketplace with Elasticsearch product search, a real-time admin dashboard over Socket.io, automated Amazon Seller, eBay and Tyre24 order synchronisation through SOAP and REST integrations, and bulk import/export workflows.",
      architecture: [
        "Vue.js storefront & admin",
        "Node.js microservices",
        "PostgreSQL",
        "Elasticsearch search",
        "Marketplace sync (Amazon · eBay · Tyre24)",
        "CouchDB analytics on AWS",
      ],
      outcome:
        "Live at retromotion.com. Multi-channel orders flow into one system, product search covers the whole catalogue, and the team works from a dashboard that updates in real time.",
      relevance:
        "Integration work is where automation projects succeed or fail. This is hands-on experience with messy third-party APIs, sync jobs and the operational tooling that keeps them running.",
    },
  },
  {
    name: "TPConnects",
    slug: "tpconnects",
    category: "Airline Retailing",
    context: "TPConnects Technologies",
    blurb:
      "NDC and IATA-certified air retailing platform. Built the booking flow from scratch to production and integrated GDS and airline suppliers via Spring Boot microservices.",
    stack: ["Angular", "React", "Java", "AWS"],
    href: "https://tpconnects.com",
    image: "/projects/tpconnects.jpg",
    status: "live",
    tint: ["#101C3A", "#2B4A8F"],
    featured: false,
    caseStudy: {
      role: "Software engineer, TPConnects Technologies, 2019–2022",
      problem:
        "Airlines and travel sellers needed an NDC-compliant retailing platform that could search, price and book across multiple GDS and airline suppliers, each with its own protocol and quirks.",
      solution:
        "Built the booking flow from scratch to production in Angular and React with NgRx and Redux managing complex booking state, and integrated GDS and airline suppliers through Java Spring Boot microservices on a fully AWS-native backend.",
      architecture: [
        "Angular / React booking UI",
        "NgRx / Redux booking state",
        "Node.js APIs",
        "Spring Boot supplier microservices",
        "GDS & airline integrations",
        "AWS Lambda · API Gateway · SNS",
      ],
      outcome:
        "An IATA NDC-certified air retailing platform in production, adapted continuously to changing client requirements over three years.",
      relevance:
        "Regulated, high-stakes transactions with many external systems — the level of engineering rigour I bring to AI systems that touch customer data and money.",
    },
  },
  {
    name: "MJ Carros Koblenz",
    slug: "mj-carros-koblenz",
    category: "Restaurant Ordering",
    context: "Built on Guessto",
    blurb:
      "A live venue running on the Guessto platform — full digital menu, allergen and diet filters, and direct ordering on its own subdomain.",
    stack: ["Next.js", "Guessto"],
    href: "https://mjcarros-koblenz.guessto.com",
    image: "/projects/mjcarros.jpg",
    status: "live",
    tint: ["#1A1512", "#4A3222"],
    featured: false,
  },
  {
    name: "DUDI",
    slug: "dudi",
    category: "Sports Community App",
    blurb:
      "Community platform for active lifestyles, shipping on iOS and Android alongside the web product.",
    stack: ["React", "Node.js"],
    href: "https://www.dudiapp.com",
    image: "/projects/dudiapp.jpg",
    status: "live",
    tint: ["#26224A", "#4C3F8F"],
    featured: false,
  },
  {
    name: "UniKoop",
    slug: "unikoop",
    category: "E-Commerce",
    blurb:
      "Dutch home-shopping storefront with multi-category catalogue, promotions and a full checkout flow.",
    stack: ["JavaScript", "E-Commerce"],
    href: "https://unikoop.nl",
    image: "/projects/unikoop.jpg",
    status: "live",
    tint: ["#EFEDFB", "#CFC6F4"],
    featured: false,
  },
  {
    name: "DeutschFlow AI",
    slug: "deutschflow-ai",
    category: "AI Language Learning",
    context: "Own product",
    blurb:
      "German language practice driven by conversational LLM agents and retrieval over graded source material.",
    stack: ["RAG", "LangGraph", "OpenAI"],
    href: "",
    image: "",
    status: "building",
    tint: ["#1C2B4A", "#3F6BB8"],
    featured: false,
  },
  {
    name: "VenueXplorer",
    slug: "venuexplorer",
    category: "Venue Discovery",
    blurb:
      "Venue discovery and booking experience built for the Singapore market.",
    stack: ["React", "Node.js"],
    href: "",
    image: "",
    status: "offline",
    tint: ["#2B2438", "#5E4A70"],
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const moreProjects = projects.filter((p) => !p.featured);

/** Projects with a full write-up, in display order. */
export const caseStudies = projects.filter(
  (p): p is Project & { caseStudy: CaseStudy } => Boolean(p.caseStudy)
);

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
