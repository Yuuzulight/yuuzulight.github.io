import { ArrowLabel, BoxLabel, DiagramDefs, DiagramFigure, RowLabel, type Box } from "./DiagramKit";

const CLAIM =
  "Merging two guest records is easy. The design choice that mattered was building the split back apart as a real path, not an afterthought, for when a merge turns out to be wrong.";

/**
 * A cycle, not a pipeline, because that is what the actual mechanism is: two
 * states a guest record moves between, not a sequence of stages. Kept
 * deliberately generic (no real channel names, no schema) since this project
 * has no public repository to check the specifics against.
 */
export function GuestIdentityDiagram() {
  const boxTwo: Box = { x: 40, y: 100, w: 380, h: 80 };
  const boxOne: Box = { x: 460, y: 100, w: 380, h: 80 };

  return (
    <DiagramFigure viewBox="0 0 880 280" ariaLabel={CLAIM} claim={CLAIM}>
      <DiagramDefs idPrefix="identity" />

      <RowLabel x={40} y={24}>
        Guest identity
      </RowLabel>

      <BoxLabel
        box={boxTwo}
        title="Two records"
        subtitle="same guest, two channels, two identifiers"
      />
      <BoxLabel box={boxOne} title="One record" subtitle="reviewed and merged into a single profile" />

      <path
        d="M 300 100 C 300 50, 580 50, 580 100"
        fill="none"
        stroke="var(--color-muted)"
        strokeOpacity={0.55}
        strokeWidth={1.5}
        markerEnd="url(#identity-arrow-neutral)"
      />
      <ArrowLabel x={440} y={42} anchor="middle">
        review and merge
      </ArrowLabel>

      <path
        d="M 580 180 C 580 232, 300 232, 300 180"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2}
        markerEnd="url(#identity-arrow-accent)"
      />
      <ArrowLabel x={440} y={252} anchor="middle" color="var(--color-accent)">
        split it apart, if the merge was wrong
      </ArrowLabel>
    </DiagramFigure>
  );
}
