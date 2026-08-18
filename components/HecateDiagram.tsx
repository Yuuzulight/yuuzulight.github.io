const CLAIM =
  "A project mentioned in discussion that Hecate does not yet track gets fetched and added automatically, so discussion decides what gets tracked, not just popularity.";

type Box = { x: number; y: number; w: number; h: number };

function BoxLabel({
  box,
  title,
  subtitle,
}: {
  box: Box;
  title: string;
  subtitle?: string;
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
        stroke="var(--color-hairline)"
        strokeWidth={1.5}
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

function RowLabel({ x, y, children }: { x: number; y: number; children: string }) {
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

function ArrowLabel({
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

/**
 * Hecate's actual data flow, not a stand-in. The one thing worth making
 * visually loud is the feedback loop: social_mentions can add a project to
 * raw_repositories on its own, which is the mechanism that separates this
 * from a tracker seeded purely by popularity. Everything else is neutral ink
 * and muted strokes so that loop is the only accent-colored thing on the page.
 */
export function HecateDiagram() {
  const a1: Box = { x: 40, y: 36, w: 380, h: 64 };
  const a2: Box = { x: 460, y: 36, w: 380, h: 64 };
  const b1: Box = { x: 40, y: 170, w: 380, h: 64 };
  const b2: Box = { x: 460, y: 170, w: 380, h: 64 };
  const c1: Box = { x: 40, y: 362, w: 380, h: 64 };
  const d: Box = { x: 40, y: 496, w: 800, h: 76 };
  const e: Box = { x: 40, y: 636, w: 800, h: 64 };

  return (
    <figure className="mt-8">
      <div className="overflow-x-auto rounded-[26px] bg-surface p-5 ring-1 ring-hairline ring-inset sm:p-7">
        <svg
          viewBox="0 0 880 720"
          role="img"
          aria-label={CLAIM}
          style={{ width: "100%", height: "auto", minWidth: 640 }}
        >
          <defs>
            <marker
              id="hecate-arrow-neutral"
              markerWidth={8}
              markerHeight={8}
              refX={4}
              refY={4}
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 z" fill="var(--color-muted)" fillOpacity={0.55} />
            </marker>
            <marker
              id="hecate-arrow-accent"
              markerWidth={9}
              markerHeight={9}
              refX={4.5}
              refY={4.5}
              orient="auto"
            >
              <path d="M0 0 L9 4.5 L0 9 z" fill="var(--color-accent)" />
            </marker>
          </defs>

          {/* Row: sources */}
          <RowLabel x={40} y={24}>
            Sources
          </RowLabel>
          <BoxLabel box={a1} title="Popularity-seeded" subtitle="GitHub · npm · PyPI · GitLab" />
          <BoxLabel box={a2} title="Discussion" subtitle="Hacker News · Lobsters" />

          <line
            x1={180}
            y1={100}
            x2={180}
            y2={170}
            stroke="var(--color-muted)"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            markerEnd="url(#hecate-arrow-neutral)"
          />
          <ArrowLabel x={195} y={138}>
            extractors
          </ArrowLabel>

          <line
            x1={650}
            y1={100}
            x2={650}
            y2={170}
            stroke="var(--color-muted)"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            markerEnd="url(#hecate-arrow-neutral)"
          />
          <ArrowLabel x={665} y={138}>
            link resolution
          </ArrowLabel>

          {/* Row: intake */}
          <RowLabel x={40} y={158}>
            Intake
          </RowLabel>
          <BoxLabel
            box={b1}
            title="raw_repositories"
            subtitle="normalised to one schema · upserted idempotently"
          />
          <BoxLabel
            box={b2}
            title="social_mentions"
            subtitle="every post resolved back to a project"
          />

          {/* The feedback loop. The only accent-colored path on the diagram. */}
          <path
            d="M 520 234 C 520 305, 300 305, 300 234"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2}
            markerEnd="url(#hecate-arrow-accent)"
          />
          <ArrowLabel x={410} y={323} color="var(--color-accent)" anchor="middle">
            discovers untracked projects
          </ArrowLabel>

          {/* social_mentions also feeds dbt directly, staying in its own lane
              on the right so it never crosses the loop or the left column. */}
          <line
            x1={750}
            y1={234}
            x2={750}
            y2={496}
            stroke="var(--color-muted)"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            markerEnd="url(#hecate-arrow-neutral)"
          />
          <ArrowLabel x={765} y={400}>
            discussion volume
          </ArrowLabel>

          <line
            x1={140}
            y1={234}
            x2={140}
            y2={362}
            stroke="var(--color-muted)"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            markerEnd="url(#hecate-arrow-neutral)"
          />
          <ArrowLabel x={155} y={300}>
            daily snapshot
          </ArrowLabel>

          {/* Row: storage */}
          <RowLabel x={40} y={350}>
            Storage
          </RowLabel>
          <BoxLabel
            box={c1}
            title="repository_snapshots"
            subtitle="daily, the only history in the system"
          />

          <line
            x1={200}
            y1={426}
            x2={200}
            y2={496}
            stroke="var(--color-muted)"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            markerEnd="url(#hecate-arrow-neutral)"
          />
          <ArrowLabel x={215} y={462}>
            history
          </ArrowLabel>

          {/* Row: transform */}
          <RowLabel x={40} y={484}>
            Transform
          </RowLabel>
          <BoxLabel box={d} title="dbt" subtitle="staging → facts, dimensions, growth, momentum" />

          <line
            x1={440}
            y1={572}
            x2={440}
            y2={636}
            stroke="var(--color-muted)"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            markerEnd="url(#hecate-arrow-neutral)"
          />
          <ArrowLabel x={455} y={604}>
            reads
          </ArrowLabel>

          {/* Row: serve */}
          <RowLabel x={40} y={624}>
            Serve
          </RowLabel>
          <BoxLabel
            box={e}
            title="Grafana · Prometheus"
            subtitle="dashboards and metrics, with alerts when a run does not land"
          />
        </svg>
      </div>
      <figcaption className="mt-3 text-[0.83rem] leading-relaxed text-muted">{CLAIM}</figcaption>
    </figure>
  );
}
