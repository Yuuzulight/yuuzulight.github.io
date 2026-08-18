import Link from "next/link";
import { site } from "@/content/site";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#stack", label: "Stack" },
  { href: "/#about", label: "About" },
];

/**
 * Floating pill, detached from the top edge. Stays on one line at every width:
 * the three section links drop below 640px, leaving the mark and the contact
 * action, so there is never a second row and never a hamburger for three items.
 * backdrop-blur is safe here because the element is sticky, not scrolling content.
 */
export function SiteNav() {
  return (
    <div className="sticky top-4 z-40 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className="flex items-center gap-1 rounded-full bg-surface/85 p-1.5 shadow-lift ring-1 ring-hairline backdrop-blur-xl"
      >
        <Link
          href="/"
          className="flex min-h-11 items-center rounded-full px-4 font-display text-[1.05rem] font-bold tracking-tight"
        >
          {site.handle.toLowerCase()}
          <span className="text-accent">.</span>
        </Link>

        <ul className="hidden items-center sm:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-11 items-center rounded-full px-3.5 text-[0.9rem] text-muted transition-colors duration-500 ease-soft hover:text-ink"
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
