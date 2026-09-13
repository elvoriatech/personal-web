import Link from "next/link";
import { documents, navLinks, site, socials } from "@/content/site";
import { services } from "@/content/services";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  const activeSocials = socials.filter((s) => s.href.length > 0);

  return (
    <footer className="border-t border-line bg-bg">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
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
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
                    <path
                      d="M8 2.5v8m0 0L4.8 7.3M8 10.5l3.2-3.2M2.8 13.2h10.4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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

        <nav aria-labelledby="footer-links">
          <h2
            id="footer-links"
            className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink"
          >
            Quick Links
          </h2>
          <ul className="mt-4 space-y-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block py-1 text-[13.5px] text-body transition-colors hover:text-accent-deep"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
            Services
          </h2>
          <ul className="mt-4 space-y-2.5">
            {services.map((s) => (
              <li key={s.title}>
                <Link
                  href="/#services"
                  className="inline-block py-1 text-[13.5px] text-body transition-colors hover:text-accent-deep"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
            Get in Touch
          </h2>
          <ul className="mt-4 space-y-2.5 text-[13.5px] text-body">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="inline-block break-all py-1 transition-colors hover:text-accent-deep"
              >
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${site.phoneHref}`}
                className="inline-block py-1 transition-colors hover:text-accent-deep"
              >
                {site.phone}
              </a>
            </li>
            <li>{site.location}</li>
            <li className="pt-1.5">
              <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] text-body">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-green-500"
                />
                Available for new projects
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-[12px] text-muted sm:flex-row">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p>Built with Next.js · Deployed on Vercel</p>
        </div>
      </div>
    </footer>
  );
}
