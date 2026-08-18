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
        className={`flex h-full flex-col rounded-[23px] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] sm:p-7 ${tones[tone].core}`}
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
