import { blogSparkPath } from "@/lib/sparkline";

/** Renders a post's real `sparkline` series. Callers already check the
    field exists before rendering this -- there's no placeholder state for
    a post without one, since a flat or invented line would be worse than
    just not showing a chart. */
export function PostSpark({ values, className = "" }: { values: number[]; className?: string }) {
  const spark = blogSparkPath(values);

  return (
    <svg
      viewBox="0 0 160 76"
      className={`shrink-0 ${className}`}
      aria-label={`Trend from the post: ${values[0]} to ${values[values.length - 1]}`}
    >
      <path d={spark.fill} fill="var(--color-accent)" opacity="0.14" />
      <path
        d={spark.line}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={spark.last.x} cy={spark.last.y} r="3" fill="var(--color-accent)" />
    </svg>
  );
}
