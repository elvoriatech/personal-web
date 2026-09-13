"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Counts a stat up when it scrolls into view.
 *
 * Accepts the display string ("8+", "6") and animates only the leading digits,
 * preserving any suffix. The final value is what renders on the server, so the
 * correct number is present even if JavaScript never runs.
 */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const match = /^(\d+)(.*)$/.exec(value.trim());
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(target ?? value);

  useEffect(() => {
    if (target === null || reduced || !inView) return;
    const controls = animate(0, target, {
      duration: Math.min(1.1, 0.35 + target * 0.05),
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, target]);

  if (target === null) return <span className={className}>{value}</span>;

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
