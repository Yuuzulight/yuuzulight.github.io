import { Children, type ReactNode } from "react";

/**
 * Entrance stagger for above-the-fold content. Each direct child gets an
 * increasing animation delay. Same CSS animation as Reveal, so it carries the
 * same guarantee: if anything goes wrong, the content is still visible.
 */
export function Stagger({
  children,
  className,
  delay = 0,
  step = 0.08,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  step?: number;
}) {
  return (
    <div className={className}>
      {Children.toArray(children).map((child, index) => (
        <div key={index} className="rise" style={{ animationDelay: `${delay + index * step}s` }}>
          {child}
        </div>
      ))}
    </div>
  );
}
