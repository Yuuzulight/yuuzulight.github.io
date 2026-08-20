"use client";

import { useEffect, useRef } from "react";

/**
 * Persistent background wash, mounted once in the root layout so it sits
 * behind every page. `z-index: -1` and `overflow: hidden` on the wrapper
 * (see .ambient-bg in globals.css) keep it from ever expanding the
 * document's scrollable area or landing above real content.
 *
 * The dot grid and its two glows drift with scroll position via a plain
 * scroll listener, not CSS animation-timeline: scroll() — browser support
 * for that feature is still too inconsistent to rely on here.
 */
export function AmbientBackground() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = gridRef.current;
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const frac = max > 0 ? window.scrollY / max : 0;
        target.style.transform = `translate(${frac * 5}%, ${frac * -6}%) scale(${1 + frac * 0.1})`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-grid" ref={gridRef} />
    </div>
  );
}
