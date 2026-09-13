import Link from "next/link";
import { documents, navLinks, site, socials } from "@/content/site";
import { services, type Service } from "@/content/services";
import { Logo } from "./Logo";
import { Reveal } from "@/components/ui/Reveal";

/** Small inline icons — no font or sprite, so nothing extra loads. */
function Icon({ path, className = "" }: { path: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {path}
    </svg>
  );
}

const mailIcon = <><path d="M3 6.5h18v11H3z" /><path d="M3 7l9 6 9-6" /></>;
const phoneIcon = (
  <path d="M5 3.5h3.2l1.4 4-2 1.4a12 12 0 006.5 6.5l1.4-2 4 1.4V18a2.5 2.5 0 01-2.7 2.5A16.5 16.5 0 013.5 6.2 2.5 2.5 0 015 3.5z" />
);
const pinIcon = (
  <><path d="M12 21s7-5.1 7-10a7 7 0 10-14 0c0 4.9 7 10 7 10z" /><circle cx="12" cy="11" r="2.4" /></>
);
const downloadIcon = (
  <path d="M12 3v10m0 0l-4-4m4 4l4-4M4 19h16" />
);

const serviceIcons: Record<Service["icon"], React.ReactNode> = {
  web: <><rect x="2.5" y="4" width="19" height="15" rx="2.5" /><path d="M2.5 8.5h19" /></>,
  mobile: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.6 18.6h2.8" /></>,
  desktop: <><rect x="2.5" y="4" width="19" height="12.5" rx="2" /><path d="M8 20.5h8M12 16.5v4" /></>,
  ai: <><circle cx="12" cy="12" r="3.4" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></>,
};

export function Footer() {
  const year = new Date().getFullYear();
  const activeSocials = socials.filter((s) => s.href.length > 0);
  // Experience lives on the page but is dropped from the footer index.
  const quickLinks = navLinks.filter((l) => l.label !== "Experience");

  return (
    <footer className="border-t border-line bg-bg">
      <Reveal className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {/* --------------------------- identity --------------------------- */}
        <div>
          <Logo />
          <p className="mt-4 max-w-[32ch] text-[13.5px] leading-[1.7] text-body">
            Building enterprise-grade web, mobile and desktop products — and the
            AI systems that make them smarter.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {documents.map((doc) => (
              <li key={doc.label}>
                <a
                  href={doc.href}
                  download
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-pill border border-line bg-surface px-3.5 text-[12px] text-body transition-colors hover:border-accent hover:text-accent-deep"
                >
                  <Icon path={downloadIcon} className="h-3 w-3" />
                  {doc.label}
                </a>
              </li>
            ))}
          </ul>
          {activeSocials.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {activeSocials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="inline-flex min-h-[36px] items-center rounded-pill border border-line bg-surface px-3.5 text-[12px] text-body transition-colors hover:border-accent hover:text-accent-deep"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* -------------------------- quick links -------------------------- */}
        <nav aria-labelledby="footer-links">
          <h2
            id="footer-links"
            className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink"
          >
            Quick Links
          </h2>
          <ul className="mt-4 space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-2 py-1 text-[13.5px] text-body transition-colors hover:text-accent-deep"
                >
                  <span
                    aria-hidden="true"
                    className="h-1 w-1 rounded-full bg-accent/50 transition-all group-hover:w-3 group-hover:bg-accent"
                  />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---------------------------- services --------------------------- */}
        <div>
          <h2 className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
            Services
          </h2>
          <ul className="mt-4 space-y-2.5">
            {services.map((s) => (
              <li key={s.title}>
                <Link
                  href="/#services"
                  className="inline-flex items-center gap-2.5 py-1 text-[13.5px] text-body transition-colors hover:text-accent-deep"
                >
                  <Icon path={serviceIcons[s.icon]} className="shrink-0 text-accent-deep" />
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* -------------------------- get in touch ------------------------- */}
        <div>
          <h2 className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
            Get in Touch
          </h2>
          <ul className="mt-4 space-y-2.5 text-[13.5px] text-body">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2.5 break-all py-1 transition-colors hover:text-accent-deep"
              >
                <Icon path={mailIcon} className="shrink-0 text-accent-deep" />
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${site.phoneHref}`}
                className="inline-flex items-center gap-2.5 py-1 transition-colors hover:text-accent-deep"
              >
                <Icon path={phoneIcon} className="shrink-0 text-accent-deep" />
                {site.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon path={pinIcon} className="shrink-0 text-accent-deep" />
              {site.location}
            </li>
            <li className="pt-1.5">
              <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] text-body">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Available for new projects
              </span>
            </li>
          </ul>
        </div>
      </Reveal>

      {/* ---------------------------- bottom strip ---------------------------- */}
      <div className="accent-gradient">
        <div className="container-site py-4 text-center text-[12px] text-white/90">
          © {year} {site.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
