// Shared primitives for the hand-built architecture diagrams on project
// pages. Kept intentionally small: a labelled box, a row caption, and an
// arrow label, all styled from the site's own tokens rather than a second
// palette, so a diagram never reads as a foreign element dropped onto the
// page.

export type Box = { x: number; y: number; w: number; h: number };

export function DiagramDefs({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <marker
        id={`${idPrefix}-arrow-neutral`}
        markerWidth={8}
        markerHeight={8}
        refX={4}
        refY={4}
        orient="auto"
      >
        <path d="M0 0 L8 4 L0 8 z" fill="var(--color-muted)" fillOpacity={0.55} />
      </marker>
      <marker
        id={`${idPrefix}-arrow-accent`}
        markerWidth={9}
        markerHeight={9}
        refX={4.5}
        refY={4.5}
        orient="auto"
      >
        <path d="M0 0 L9 4.5 L0 9 z" fill="var(--color-accent)" />
      </marker>
    </defs>
  );
}

export function BoxLabel({
  box,
  title,
  subtitle,
  dashed = false,
}: {
  box: Box;
  title: string;
  subtitle?: string;
  dashed?: boolean;
}) {
  const tx = box.x + 20;
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={10}
        fill="var(--color-paper)"
        stroke={dashed ? "var(--color-accent)" : "var(--color-hairline)"}
        strokeWidth={1.5}
        strokeDasharray={dashed ? "6,4" : undefined}
      />
      <text
        x={tx}
        y={box.y + (subtitle ? 26 : box.h / 2 + 6)}
        fill="var(--color-ink)"
        fontFamily="var(--font-display)"
        fontWeight={600}
        fontSize={17}
      >
        {title}
      </text>
      {subtitle ? (
        <text
          x={tx}
          y={box.y + 46}
          fill="var(--color-muted)"
          fontFamily="var(--font-sans)"
          fontSize={13}
        >
          {subtitle}
        </text>
      ) : null}
    </g>
  );
}

export function RowLabel({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text
      x={x}
      y={y}
      fill="var(--color-muted)"
      fontFamily="var(--font-mono)"
      fontSize={12}
      letterSpacing={2}
    >
      {children.toUpperCase()}
    </text>
  );
}

export function ArrowLabel({
  x,
  y,
  children,
  color = "var(--color-muted)",
  anchor = "start",
}: {
  x: number;
  y: number;
  children: string;
  color?: string;
  anchor?: "start" | "middle";
}) {
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontFamily="var(--font-sans)"
      fontSize={12.5}
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  idPrefix,
  accent = false,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  idPrefix: string;
  accent?: boolean;
  dashed?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={accent ? "var(--color-accent)" : "var(--color-muted)"}
      strokeOpacity={accent ? 1 : 0.45}
      strokeWidth={accent ? 2 : 1.5}
      strokeDasharray={dashed ? "6,4" : undefined}
      markerEnd={`url(#${idPrefix}-arrow-${accent ? "accent" : "neutral"})`}
    />
  );
}

export function DiagramFigure({
  viewBox,
  ariaLabel,
  claim,
  children,
}: {
  viewBox: string;
  ariaLabel: string;
  claim: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="mt-8">
      <div className="overflow-x-auto rounded-[26px] bg-surface p-5 ring-1 ring-hairline ring-inset sm:p-7">
        <svg
          viewBox={viewBox}
          role="img"
          aria-label={ariaLabel}
          style={{ width: "100%", height: "auto", minWidth: 640 }}
        >
          {children}
        </svg>
      </div>
      <figcaption className="mt-3 text-[0.83rem] leading-relaxed text-muted">{claim}</figcaption>
    </figure>
  );
}
