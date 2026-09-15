import { faqs, packages, positioning } from "@/content/business";
import { caseStudies } from "@/content/projects";
import { services } from "@/content/services";
import { site, socials } from "@/content/site";

/**
 * schema.org graphs shared by the layout and the homepage. Google reads these
 * for rich results; AI search engines read them to answer "who is X" and
 * "what does X offer" without guessing from prose.
 */

export const PERSON_ID = `${site.url}/#person`;
export const BUSINESS_ID = `${site.url}/#business`;
export const WEBSITE_ID = `${site.url}/#website`;

const ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Mülheim-Kärlich",
  addressRegion: "Rheinland-Pfalz",
  addressCountry: "DE",
};

/** "from €1,500" → "1500" for schema price fields. */
function numericPrice(price: string): string {
  return price.replace(/[^\d.,]/g, "").replace(/,/g, "");
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    jobTitle: positioning.title,
    description: site.description,
    url: site.url,
    image: `${site.url}/opengraph-image`,
    sameAs: socials.map((s) => s.href).filter(Boolean),
    email: `mailto:${site.email}`,
    telephone: site.phone,
    address: ADDRESS,
    knowsLanguage: ["en", "de", "ur"],
    knowsAbout: [
      "AI agents",
      "Retrieval-Augmented Generation",
      "LLM application development",
      "Model Context Protocol",
      "Workflow automation",
      "LangChain",
      "LangGraph",
      "OpenAI",
      "Anthropic Claude",
      "TypeScript",
      "Node.js",
      "Python",
      "Next.js",
      "Angular",
      "PostgreSQL",
      "AWS",
      "Kubernetes",
    ],
    alumniOf: { "@type": "CollegeOrUniversity", name: "Virtual University of Pakistan" },
    worksFor: { "@id": BUSINESS_ID },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
  };
}

export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": BUSINESS_ID,
    name: `${site.name} — ${positioning.title}`,
    url: site.url,
    description: site.description,
    image: `${site.url}/opengraph-image`,
    telephone: site.phone,
    email: site.email,
    founder: { "@id": PERSON_ID },
    address: ADDRESS,
    areaServed: [
      { "@type": "Country", name: "Germany" },
      { "@type": "Place", name: "European Union" },
      { "@type": "Place", name: "Remote worldwide" },
    ],
    availableLanguage: ["English", "German"],
    priceRange: "€250 – €10,000+",
    knowsAbout: services.map((s) => s.title),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AI engineering services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          "@id": `${site.url}/#${s.id}`,
          name: s.title,
          description: s.blurb,
          serviceType: s.title,
          provider: { "@id": PERSON_ID },
        },
      })),
    },
    makesOffer: packages.map((p) => ({
      "@type": "Offer",
      name: p.name,
      description: p.summary,
      price: numericPrice(p.price),
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: numericPrice(p.price),
        priceCurrency: "EUR",
        description: `${p.price}${p.priceNote ? ` ${p.priceNote}` : ""} · ${p.timeline}`,
      },
      url: `${site.url}/#pricing`,
    })),
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${site.url}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function caseStudyListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${site.url}/#work`,
    name: "Case studies",
    itemListElement: caseStudies.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}/work/${p.slug}`,
      name: p.name,
    })),
  };
}

export function caseStudyJsonLd(slug: string) {
  const project = caseStudies.find((p) => p.slug === slug);
  if (!project) return null;
  const url = `${site.url}/work/${project.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": url,
      url,
      name: `${project.name} — ${project.category}`,
      headline: `${project.name}: ${project.category}`,
      description: project.blurb,
      abstract: project.caseStudy.problem,
      author: { "@id": PERSON_ID },
      creator: { "@id": PERSON_ID },
      keywords: project.stack.join(", "),
      inLanguage: "en",
      isPartOf: { "@id": WEBSITE_ID },
      ...(project.href ? { sameAs: project.href } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Work", item: `${site.url}/#work` },
        { "@type": "ListItem", position: 3, name: project.name, item: url },
      ],
    },
  ];
}
