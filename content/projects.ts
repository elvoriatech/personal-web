export type Project = {
  name: string;
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
  },
  {
    name: "RankForge AI",
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
  },
  {
    name: "Retromotion",
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
  },
  {
    name: "TPConnects",
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
  },
  {
    name: "MJ Carros Koblenz",
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
