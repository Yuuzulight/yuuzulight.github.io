import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/content/projects";
import { Tag } from "./ui";

/**
 * Bento cell. The tray and core tones vary per cell so the grid is not six
 * identical white boxes, which is the default failure mode for this layout.
 */
const tones = {
  wash: {
    tray: "bg-linear-to-br from-accent-soft/30 via-tint to-tint-2",
    core: "bg-surface",
  },
  tinted: {
    tray: "bg-tint",
    core: "bg-linear-to-b from-tint-2/70 to-surface",
  },
  plain: {
    tray: "bg-surface-2",
    core: "bg-surface",
  },
} as const;

export type CardTone = keyof typeof tones;

/** Turns a real number series into an SVG polyline path, scaled to fill a
    100x24 box. Only called when a project actually has one (see
    Project["motif"] in content/projects.ts) -- there's no synthetic
    fallback shape for projects without real data on hand. */
function motifPath(values: number[]): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 22 - ((value - min) / span) * 20;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function ProjectCard({
  project,
  tone = "plain",
  className = "",
}: {
  project: Project;
  tone?: CardTone;
  className?: string;
}) {
  const headline = project.metrics[0];

  return (
    <Link
      href={`/work/${project.slug}/`}
      className={`group block rounded-[30px] p-[7px] ring-1 ring-hairline ring-inset transition-transform duration-600 ease-soft hover:-translate-y-1 ${tones[tone].tray} ${className}`}
    >
      <article
        className={`flex h-full flex-col rounded-[23px] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] sm:p-7 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${tones[tone].core}`}
      >
        <p className="font-mono text-[0.62rem] tracking-[0.15em] text-muted uppercase">
          {project.kind}
        </p>

        <h3 className="mt-3 font-display text-xl font-semibold tracking-tight sm:text-2xl">
          {project.name}
        </h3>

        <p className="mt-2.5 max-w-[46ch] text-[0.93rem] leading-relaxed text-muted">
          {project.blurb}
        </p>

        {headline ? (
          <p className="mt-4 font-mono text-xs text-accent">
            {headline.value} {headline.label}
          </p>
        ) : null}

        {project.motif ? (
          <svg
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
            className="mt-3 h-6 w-full"
            aria-hidden="true"
          >
            <path
              d={motifPath(project.motif)}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          </svg>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 4).map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>

        <span className="mt-6 inline-flex items-center gap-1.5 font-display text-[0.9rem] font-medium text-accent">
          Read the write-up
          <ArrowRight
            size={14}
            weight="bold"
            aria-hidden
            className="transition-transform duration-500 ease-soft group-hover:translate-x-1"
          />
        </span>
      </article>
    </Link>
  );
}
