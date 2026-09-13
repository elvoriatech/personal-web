"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks } from "@/content/site";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { Logo } from "./Logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("/#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll-spy: highlight the section currently nearest the top of the page. */
  useEffect(() => {
    const ids = navLinks
      .filter((l) => l.href.startsWith("/#"))
      .map((l) => l.href.slice(2));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(`/#${visible.target.id}`);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  /* Prevent the page scrolling behind the open mobile menu. */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-line bg-surface/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-site flex h-[76px] items-center justify-between gap-6">
        <Link href="/#home" aria-label="Zahoor Ahmed — home" className="min-w-0 shrink">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative block py-2 font-display text-[12px] font-medium uppercase tracking-[0.12em] transition-colors ${
                      isActive
                        ? "text-accent-deep"
                        : "text-body hover:text-ink"
                    }`}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-accent transition-all duration-300 ${
                        isActive ? "w-full" : "w-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {/* Wrapped rather than given `hidden` directly: the button's own
              `inline-flex` is the same Tailwind layer, so a display utility
              passed via className loses on stylesheet order. */}
          <span className="hidden min-[380px]:block">
            <ButtonLink href="/#contact" variant="outline">
              Let&apos;s Talk
              <ArrowRight />
            </ButtonLink>
          </span>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-ink lg:hidden"
          >
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
              {open ? (
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-line bg-surface lg:hidden"
        >
          <ul className="container-site flex flex-col py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line/70 py-3.5 font-display text-[13px] font-medium uppercase tracking-[0.12em] text-body last:border-0 hover:text-accent-deep"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="py-4">
              <ButtonLink
                href="/#contact"
                variant="primary"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Let&apos;s Talk
                <ArrowRight />
              </ButtonLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
