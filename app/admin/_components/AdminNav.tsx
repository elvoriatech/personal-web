"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavItem = { href: string; label: string; icon: NavIcon };
export type NavGroup = { title: string; items: NavItem[] };
export type NavIcon =
  | "home"
  | "resume"
  | "letter"
  | "templates"
  | "blog"
  | "campaigns"
  | "send";

/**
 * Sidebar navigation. Client-side only for the active state — the shell
 * around it stays a server component so the session check runs per request.
 */
export function AdminNav({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-3 font-display text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group flex min-h-[40px] items-center gap-2.5 rounded-xl px-3 text-[13.5px] transition-colors ${
                      active
                        ? "bg-bg-violet font-semibold text-accent-deep"
                        : "text-body hover:bg-bg-tint hover:text-ink"
                    }`}
                  >
                    <span
                      className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center ${
                        active ? "text-accent-deep" : "text-muted group-hover:text-ink"
                      }`}
                    >
                      <Icon name={item.icon} />
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Line icons, 16px grid, inherit currentColor. */
function Icon({ name }: { name: NavIcon }): ReactNode {
  const common = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "h-4 w-4",
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M2.5 7.5 8 3l5.5 4.5V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V7.5Z" />
          <path d="M6.5 13.5v-4h3v4" />
        </svg>
      );
    case "resume":
      return (
        <svg {...common}>
          <path d="M4 2.5h5.5L12.5 5.5v8a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5Z" />
          <path d="M9.5 2.5v3h3M5.5 8h5M5.5 10.5h5" />
        </svg>
      );
    case "letter":
      return (
        <svg {...common}>
          <rect x="2.5" y="3.5" width="11" height="9" rx="1" />
          <path d="m2.5 4.5 5.5 4 5.5-4" />
        </svg>
      );
    case "templates":
      return (
        <svg {...common}>
          <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
          <path d="M2.5 6h11M6 6v7.5" />
        </svg>
      );
    case "blog":
      return (
        <svg {...common}>
          <path d="M3 13.5 3.7 11l6.9-6.9a1.4 1.4 0 0 1 2 0l.3.3a1.4 1.4 0 0 1 0 2L6 13.3l-3 .2Z" />
          <path d="m9.8 4.9 1.3 1.3" />
        </svg>
      );
    case "campaigns":
      return (
        <svg {...common}>
          <path d="M2.5 9.5v-3l8-3.5v10l-8-3.5Z" />
          <path d="M10.5 6.5c1.2.3 2 1 2 1.5s-.8 1.2-2 1.5M5 10v2.5a.5.5 0 0 0 .5.5h1" />
        </svg>
      );
    case "send":
      return (
        <svg {...common}>
          <path d="M13.5 2.5 2.5 7l4.5 1.5L8.5 13l5-10.5Z" />
          <path d="m7 8.5 6.5-6" />
        </svg>
      );
  }
}
