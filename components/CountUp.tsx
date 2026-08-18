"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Counts a stat up when it scrolls into view.
 *
 * Values arrive as display strings ("96,646", "50+", "$1.20", "MIT"), so the
 * numeric part is extracted and the surrounding characters are preserved. A
 * value with no number in it renders as plain text.
 *
 * The tween writes straight to textContent through a ref. Driving this through
 * useState would re-render on every frame and stutter on a phone.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();

  // Memoised: a fresh match array each render is an unstable effect
  // dependency, which restarts the tween every time the tree re-renders.
  const match = useMemo(() => value.match(/^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/), [value]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !match || !inView) return;

    const [, prefix, rawNumber, suffix] = match;
    const target = Number(rawNumber.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;

    const decimals = rawNumber.includes(".") ? rawNumber.split(".")[1].length : 0;
    const grouped = rawNumber.includes(",");

    const format = (n: number) => {
      const fixed = n.toFixed(decimals);
      const withGrouping = grouped
        ? Number(fixed).toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : fixed;
      return `${prefix}${withGrouping}${suffix}`;
    };

    if (reduceMotion) {
      node.textContent = format(target);
      return;
    }

    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });

    return () => controls.stop();
  }, [inView, match, reduceMotion]);

  // Server render and the no-number case both show the value as written, so
  // the number is present even if JavaScript never runs.
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
