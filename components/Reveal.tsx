import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/**
 * Scroll reveal, driven entirely by CSS (see the `rise` rules in globals.css).
 *
 * This used to be a Motion client component. It was rewritten because the
 * JavaScript version rendered every wrapped element at opacity 0 in the static
 * HTML, which meant a failed script left the page blank. It is also now a
 * server component, so it ships no JavaScript at all.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <div
      className={className ? `rise ${className}` : "rise"}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
