"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * One deliberate hover interaction, scoped to whatever it wraps rather than
 * built into ActionLink/GhostLink themselves -- those are used all over the
 * site, and this is meant to be the hero's one signature move, not a
 * behavior every button on every page suddenly has.
 *
 * Position is tracked with motion values, never useState: this updates on
 * every mousemove, and useState would re-render the React tree that often.
 */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 20, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 250, damping: 20, mass: 0.3 });

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: "inline-block" }}
      onMouseMove={(event) => {
        const box = ref.current?.getBoundingClientRect();
        if (!box) return;
        x.set((event.clientX - (box.left + box.width / 2)) * strength);
        y.set((event.clientY - (box.top + box.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
