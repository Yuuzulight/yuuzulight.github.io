import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ArrowRight } from "@phosphor-icons/react/dist/ssr";

/**
 * Primary action. The trailing icon sits inside its own circular well rather
 * than floating naked beside the label, and the well is what moves on hover.
 * Minimum height is 44px so it is a real touch target on a phone.
 */
export function ActionLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const content = (
    <>
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-white/20 transition-transform duration-500 ease-soft group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
        {external ? (
          <ArrowUpRight size={14} weight="bold" aria-hidden />
        ) : (
          <ArrowRight size={14} weight="bold" aria-hidden />
        )}
      </span>
    </>
  );

  const className =
    "group inline-flex min-h-11 items-center gap-3 rounded-full bg-accent py-1.5 pr-1.5 pl-5 font-display text-[0.95rem] font-medium text-accent-ink shadow-cta transition-transform duration-500 ease-soft hover:-translate-y-px active:scale-[0.985]";

  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer noopener">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

/** Secondary action. Same height, quieter surface. */
export function GhostLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const className =
    "inline-flex min-h-11 items-center rounded-full bg-surface px-5 font-display text-[0.95rem] font-medium text-ink ring-1 ring-hairline transition-transform duration-500 ease-soft hover:-translate-y-px active:scale-[0.985]";

  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/**
 * Nested enclosure. An outer tinted tray holds an inner surface, with the
 * inner radius reduced by the tray padding so the curves stay concentric.
 */
export function Shell({
  children,
  className = "",
  tone = "tint",
}: {
  children: ReactNode;
  className?: string;
  tone?: "tint" | "surface" | "accent";
}) {
  const trays = {
    tint: "bg-tint",
    surface: "bg-surface-2",
    accent: "bg-linear-to-br from-accent-soft/35 to-tint",
  };

  return (
    <div
      className={`rounded-[30px] p-[7px] ring-1 ring-hairline ring-inset ${trays[tone]} ${className}`}
    >
      <div className="h-full rounded-[23px] bg-surface p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] sm:p-7">
        {children}
      </div>
    </div>
  );
}

/** Ambient background wash. Gradients, not blur filters, so it costs nothing to scroll. */
export function Glow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-72 -left-56 size-[760px] rounded-full bg-[radial-gradient(circle_at_center,rgba(196,190,244,0.55)_0%,transparent_66%)]" />
      <div className="absolute -top-56 -right-72 size-[820px] rounded-full bg-[radial-gradient(circle_at_center,rgba(146,120,226,0.32)_0%,transparent_64%)]" />
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-[0.72rem] text-ink">
      {children}
    </span>
  );
}
