import { techIcons } from "./techIcons";

/**
 * Renders a technology mark. Falls back to a wordmark tile for brands whose
 * logo isn't available under a permissive licence (currently AWS).
 */
export function TechIcon({ name, size = 26 }: { name: string; size?: number }) {
  const icon = techIcons[name];
  if (!icon) return null;

  if (icon.wordmark) {
    return (
      <span
        aria-hidden="true"
        style={{ color: icon.hex, fontSize: size * 0.64, lineHeight: 1 }}
        className="font-display font-bold tracking-tight"
      >
        {icon.wordmark}
      </span>
    );
  }

  return (
    <svg
      role="img"
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={icon.hex}
    >
      <path d={icon.path} />
    </svg>
  );
}
