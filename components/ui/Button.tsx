import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-display font-semibold " +
  "transition-all duration-200 whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "accent-gradient text-white shadow-[0_8px_20px_-8px_rgba(109,79,208,0.7)] " +
    "hover:shadow-[0_12px_26px_-8px_rgba(109,79,208,0.85)] hover:-translate-y-0.5",
  outline:
    "bg-surface text-ink border border-line hover:border-accent hover:text-accent-deep hover:-translate-y-0.5",
  ghost: "text-accent-deep hover:text-ink",
};

/* min-h keeps every control at a 44px touch target. */
const sizes: Record<Size, string> = {
  md: "text-[13px] tracking-[0.06em] uppercase px-5 min-h-[44px]",
  lg: "text-[13px] tracking-[0.08em] uppercase px-7 min-h-[52px]",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: BaseProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  href,
  children,
  ...rest
}: BaseProps & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const isInternal = href.startsWith("#") || href.startsWith("/");

  if (isInternal && !href.endsWith(".pdf")) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      {...(href.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2.5 8h11M9.5 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
