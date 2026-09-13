"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Scroll-triggered entrance. Collapses to a plain wrapper when the visitor
 * prefers reduced motion, so nothing animates and nothing is hidden.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
  hidden = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Kept in the DOM but collapsed, so content stays crawlable. */
  hidden?: boolean;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className} hidden={hidden}>{children}</div>;

  return (
    <motion.div
      className={className}
      hidden={hidden}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
