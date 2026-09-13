import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { site, socials } from "@/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Zahoor Ahmed",
    "Senior Software Engineer",
    "AI Engineer",
    "RAG",
    "LangChain",
    "Next.js",
    "Angular",
    "NestJS",
    "AWS",
    "Kubernetes",
    "Website development",
    "Mobile app development",
    "Desktop application development",
    "Germany",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#8b73e4",
  colorScheme: "light",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Senior Software Engineer · AI Engineer",
  description: site.description,
  url: site.url,
  // Public profiles, so search engines can tie them to this identity.
  sameAs: socials.map((s) => s.href).filter(Boolean),
  email: `mailto:${site.email}`,
  telephone: site.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mülheim-Kärlich",
    addressCountry: "DE",
  },
  knowsLanguage: ["en", "de", "ur"],
  knowsAbout: [
    "TypeScript",
    "Angular",
    "React",
    "Next.js",
    "Node.js",
    "NestJS",
    "Python",
    "AWS",
    "Kubernetes",
    "Retrieval-Augmented Generation",
    "LangChain",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Virtual University of Pakistan",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /* data-scroll-behavior is required in Next 16 — the framework no longer
       overrides scroll behaviour, and this site navigates entirely by anchor. */
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${poppins.variable}`}
    >
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent-deep focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
