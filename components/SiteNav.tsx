"use client";

import { useState } from "react";
import Link from "next/link";
import { useMotionValueEvent, useScroll } from "motion/react";
import { site } from "@/content/site";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/blog/", label: "Blog" },
  { href: "/#experience", label: "Experience" },
  { href: "/#stack", label: "Stack" },
];

/**
 * Floating pill, detached from the top edge. It condenses once the page has
 * scrolled past the hero: more opaque, tighter, deeper shadow.
 *
 * The scroll value is read through Motion rather than a scroll listener, and
 * only flips a boolean when it crosses the threshold, so this re-renders twice
 * per page rather than on every frame.
 *
 * Stays on one line at every width. The section links drop below 640px, leaving
 * the mark and the contact action, so there is never a second row.
 */
export function SiteNav() {
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setCondensed(latest > 40);
  });

  return (
    <div className="sticky top-4 z-40 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className={`flex items-center gap-1 rounded-full ring-1 ring-hairline backdrop-blur-xl transition-all duration-500 ease-soft ${
          condensed
            ? "bg-surface/95 p-1 shadow-[0_18px_44px_-26px_rgba(91,43,184,0.6)]"
            : "bg-surface/80 p-1.5 shadow-lift"
        }`}
      >
        <Link
          href="/"
          className="flex min-h-11 items-center rounded-full px-4 font-display text-[1.05rem] font-bold tracking-tight"
        >
          {site.wordmark}
          <span className="text-accent">.</span>
        </Link>

        <ul className="hidden items-center sm:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-11 items-center rounded-full px-3 text-[0.9rem] text-muted transition-colors duration-500 ease-soft hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href={`mailto:${site.email}`}
          className="flex min-h-11 items-center rounded-full bg-accent px-4 font-display text-[0.9rem] font-medium text-accent-ink transition-transform duration-500 ease-soft hover:-translate-y-px active:scale-[0.985]"
        >
          Contact
        </a>
      </nav>
    </div>
  );
}
