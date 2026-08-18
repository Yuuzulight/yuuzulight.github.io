import { Arrow, ArrowLabel, BoxLabel, DiagramDefs, DiagramFigure, RowLabel, type Box } from "./DiagramKit";

const CLAIM =
  "A project mentioned in discussion that Hecate does not yet track gets fetched and added automatically, so discussion decides what gets tracked, not just popularity.";

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
    <DiagramFigure viewBox="0 0 880 720" ariaLabel={CLAIM} claim={CLAIM}>
      <DiagramDefs idPrefix="hecate" />

      <RowLabel x={40} y={24}>
        Sources
      </RowLabel>
      <BoxLabel box={a1} title="Popularity-seeded" subtitle="GitHub · npm · PyPI · GitLab" />
      <BoxLabel box={a2} title="Discussion" subtitle="Hacker News · Lobsters" />

      <Arrow idPrefix="hecate" x1={180} y1={100} x2={180} y2={170} />
      <ArrowLabel x={195} y={138}>
        extractors
      </ArrowLabel>

      <Arrow idPrefix="hecate" x1={650} y1={100} x2={650} y2={170} />
      <ArrowLabel x={665} y={138}>
        link resolution
      </ArrowLabel>

      <RowLabel x={40} y={158}>
        Intake
      </RowLabel>
      <BoxLabel
        box={b1}
        title="raw_repositories"
        subtitle="normalised to one schema · upserted idempotently"
      />
      <BoxLabel box={b2} title="social_mentions" subtitle="every post resolved back to a project" />

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
      <Arrow idPrefix="hecate" x1={750} y1={234} x2={750} y2={496} />
      <ArrowLabel x={765} y={400}>
        discussion volume
      </ArrowLabel>

      <Arrow idPrefix="hecate" x1={140} y1={234} x2={140} y2={362} />
      <ArrowLabel x={155} y={300}>
        daily snapshot
      </ArrowLabel>

      <RowLabel x={40} y={350}>
        Storage
      </RowLabel>
      <BoxLabel
        box={c1}
        title="repository_snapshots"
        subtitle="daily, the only history in the system"
      />

      <Arrow idPrefix="hecate" x1={200} y1={426} x2={200} y2={496} />
      <ArrowLabel x={215} y={462}>
        history
      </ArrowLabel>

      <RowLabel x={40} y={484}>
        Transform
      </RowLabel>
      <BoxLabel box={d} title="dbt" subtitle="staging → facts, dimensions, growth, momentum" />

      <Arrow idPrefix="hecate" x1={440} y1={572} x2={440} y2={636} />
      <ArrowLabel x={455} y={604}>
        reads
      </ArrowLabel>

      <RowLabel x={40} y={624}>
        Serve
      </RowLabel>
      <BoxLabel
        box={e}
        title="Grafana · Prometheus"
        subtitle="dashboards and metrics, with alerts when a run does not land"
      />
    </DiagramFigure>
  );
}
