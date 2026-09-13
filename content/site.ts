import { projects } from "./projects";

/**
 * Single source of truth for site-wide copy and contact details.
 * Everything here comes from Zahoor's CV — edit this file, not the JSX.
 */

export const site = {
  name: "Zahoor Ahmed",
  role: "Senior Software Engineer",
  roleSecondary: "AI Engineer",
  initials: "ZA",
  tagline: "Senior Software Engineer & Applied AI Engineer",
  description:
    "Senior Software Engineer with 8+ years architecting enterprise-grade applications, now specialising in Applied AI Engineering — RAG systems, multi-agent workflows and scalable microservices on AWS and Kubernetes.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zahoorahmed.de",
  location: "Mülheim-Kärlich, Germany",
  email: "zahoor_ahmed143@hotmail.com",
  phone: "+49 162 3363430",
  phoneHref: "+491623363430",
  residency: "Permanent Residency · Deutsch B1",
  resume: "/Zahoor_Ahmed_Resume.pdf",
  coverLetter: "/Zahoor_Ahmed_Cover_Letter.pdf",
} as const;

/** Downloadable application documents, surfaced in the Career section. */
export const documents = [
  {
    label: "Résumé / CV",
    note: "Senior Software Engineer · AI Engineer — 1 page PDF",
    href: "/Zahoor_Ahmed_Resume.pdf",
  },
  {
    label: "Cover Letter",
    note: "Applied AI Engineering — 1 page PDF",
    href: "/Zahoor_Ahmed_Cover_Letter.pdf",
  },
] as const;

/**
 * Social profiles are not listed on the CV. Fill in the URLs and the links
 * appear automatically; left empty they are omitted rather than rendered dead.
 */
export const socials: { label: string; href: string }[] = [
  { label: "LinkedIn", href: "" },
  { label: "GitHub", href: "" },
  { label: "Xing", href: "" },
];

/**
 * Anchors are written page-absolute ("/#about") so they still work from
 * /blog, /resume and the admin — a bare "/#about" would do nothing there.
 */
export const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Projects", href: "/#projects" },
  { label: "Experience", href: "/#experience" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
] as const;

/**
 * Every figure is traceable: years from the CV, the product count derived from
 * the project list itself so the hero can never disagree with the work shown,
 * and countries from the roles in the CV (Germany, UAE, Pakistan).
 */
const liveProducts = projects.filter((p) => p.status === "live").length;

export const stats = [
  { value: "8+", label: "Years Experience" },
  { value: String(liveProducts), label: "Live Products" },
  { value: "3", label: "Countries Delivered" },
];

export const hero = {
  eyebrow: "Hello, I'm",
  headline: "Zahoor Ahmed",
  subheadLead: "Senior Software Engineer &",
  subheadAccent: "Applied AI",
  subheadTail: "Engineer",
  body: "I architect enterprise-grade applications and production-ready AI systems — RAG pipelines, multi-agent workflows and scalable microservices on AWS and Kubernetes.",
  primaryCta: { label: "View My Work", href: "/#projects" },
  secondaryCta: { label: "Download CV", href: "/Zahoor_Ahmed_Resume.pdf" },
} as const;

/**
 * Replaces the template's client testimonial. Zahoor has no published
 * testimonials, so this is his own professional summary, attributed to him —
 * rather than a fabricated third-party quote.
 */
export const pullQuote = {
  quote:
    "I bridge frontier AI models with robust, production-ready software architecture. Eight years of shipping fleet telematics, e-commerce and airline platforms taught me that the model is the easy part — the engineering around it is what reaches users.",
  author: site.name,
  attribution: "Senior Software Engineer · AI Engineer",
} as const;

export const experience = [
  {
    role: "Senior Software Engineer",
    company: "PTC Telematik GmbH",
    period: "Dec 2024 – Present",
    location: "Coblenz, DE",
    points: [
      "Angular 19 / TypeScript PWA modules for fleet telematics, from TDD to deployment.",
      "NestJS backend services with PostgreSQL, schema design and REST APIs.",
      "Kubernetes microservices on AWS, ensuring scalability and high availability.",
      "GitLab CI/CD pipelines with Grafana-based monitoring and observability.",
    ],
  },
  {
    role: "Full Stack Developer",
    company: "Retromotion GmbH",
    period: "Dec 2022 – Aug 2024",
    location: "Stuttgart, DE",
    points: [
      "Microservices-based e-commerce platform for auto parts (Vue.js, Node.js, TypeScript, PostgreSQL).",
      "Real-time admin dashboard with Socket.io and Elasticsearch for product search.",
      "Amazon Seller, eBay and Tyre24 order synchronisation via SOAP / REST integrations.",
      "Containerised services on AWS with CouchDB analytics and bulk import/export workflows.",
    ],
  },
  {
    role: "Software Engineer",
    company: "TPConnects Technologies",
    period: "Oct 2019 – Oct 2022",
    location: "Dubai, UAE",
    points: [
      "Flight booking platform (Angular, React, Node.js, PostgreSQL) from scratch to production.",
      "GDS and airline supplier integration using Java Spring Boot microservices.",
      "Complex booking state with NgRx and Redux, adapted to dynamic client requirements.",
      "Full AWS architecture — Lambda, API Gateway, CloudFormation, Route 53, SNS.",
    ],
  },
  {
    role: "Full Stack Developer",
    company: "Diwan Arabia Dubai LLC",
    period: "Sep 2018 – Aug 2019",
    location: "Dubai, UAE",
    points: [
      "Web servers and REST APIs with Node.js and Express — routing, middleware, cookies and sessions.",
      "Reusable React front-ends with Redux state management across hotel, real-estate and social products.",
      "Webpack bundling and Jenkins continuous integration, with Git and JIRA across the team.",
    ],
  },
  {
    role: "Web Developer",
    company: "Jinnah Software House",
    period: "Jan 2017 – Aug 2018",
    location: "Jhelum, Pakistan",
    points: [
      "Dynamic websites on core PHP, CodeIgniter and Laravel backends.",
      "WordPress theme and custom plugin development for a range of clients.",
      "Java web and Android applications backed by SQLite.",
    ],
  },
] as const;

export const education: {
  title: string;
  org: string;
  period: string;
  detail?: string;
}[] = [
  {
    title: "AI Engineering Programme",
    org: "Turing College",
    period: "2026",
    detail:
      "Prompt engineering and LLM benchmarking, RAG with LangChain, function calling, and production AI agents with long-term memory.",
  },
  {
    title: "Associate AI Engineer for Developers",
    org: "Datacamp",
    period: "2026",
  },
  {
    title: "B.Eng. Software Engineering (BSCSE)",
    org: "Virtual University of Pakistan",
    period: "2014 – 2018",
  },
];
