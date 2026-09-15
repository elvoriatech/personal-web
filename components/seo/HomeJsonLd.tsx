import { JsonLd } from "./JsonLd";
import { businessJsonLd, caseStudyListJsonLd, faqJsonLd } from "@/lib/seo/structuredData";

/** Homepage-only structured data: the service business, its FAQ and the case-study list. */
export function HomeJsonLd() {
  return <JsonLd data={[businessJsonLd(), faqJsonLd(), caseStudyListJsonLd()]} />;
}
