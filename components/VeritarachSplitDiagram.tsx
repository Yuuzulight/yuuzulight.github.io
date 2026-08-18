import { DiagramDefs, DiagramFigure, RowLabel } from "./DiagramKit";

const CLAIM =
  "A naive random split can put the human and AI answer to the same question on opposite sides of train and test, leaking the pair. Grouping by question before splitting keeps every pair on one side, which is what the real training pipeline does.";

type Item = { label: string; flagged: boolean };

function ItemRow({ x, y, items }: { x: number; y: number; items: Item[] }) {
  const boxW = 79;
  const gap = 8;
  return (
    <>
      {items.map((item, i) => {
        const bx = x + i * (boxW + gap);
        return (
          <g key={item.label}>
            <rect
              x={bx}
              y={y}
              width={boxW}
              height={36}
              rx={8}
              fill={item.flagged ? "var(--color-tint-2)" : "var(--color-paper)"}
              stroke={item.flagged ? "var(--color-accent)" : "var(--color-hairline)"}
              strokeWidth={1.5}
            />
            <text
              x={bx + boxW / 2}
              y={y + 22}
              textAnchor="middle"
              fill="var(--color-ink)"
              fontFamily="var(--font-mono)"
              fontSize={11}
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </>
  );
}

/**
 * A comparison, not a pipeline. Four question-pairs, each with a human and
 * an AI answer, split two ways: naive random assignment (which can put the
 * two halves of a pair on opposite sides) versus the group-aware split the
 * training code actually uses (which cannot). Flagged boxes, tinted and
 * accent-bordered, are the two example pairs the naive split breaks.
 */
export function VeritarachSplitDiagram() {
  const panelAx = 40;
  const panelBx = 460;
  const panelY = 40;
  const panelW = 380;
  const panelH = 190;

  return (
    <DiagramFigure viewBox="0 0 880 280" ariaLabel={CLAIM} claim={CLAIM}>
      <DiagramDefs idPrefix="split" />

      <RowLabel x={panelAx} y={26}>
        Naive split
      </RowLabel>
      <rect
        x={panelAx}
        y={panelY}
        width={panelW}
        height={panelH}
        rx={14}
        fill="var(--color-surface)"
        stroke="var(--color-hairline)"
        strokeWidth={1.5}
      />
      <RowLabel x={panelAx + 20} y={64}>
        train
      </RowLabel>
      <ItemRow
        x={panelAx + 20}
        y={76}
        items={[
          { label: "Q1 · H", flagged: true },
          { label: "Q2 · H", flagged: false },
          { label: "Q2 · A", flagged: false },
          { label: "Q4 · H", flagged: true },
        ]}
      />
      <line
        x1={panelAx + 10}
        y1={124}
        x2={panelAx + panelW - 10}
        y2={124}
        stroke="var(--color-hairline)"
        strokeWidth={1.5}
      />
      <RowLabel x={panelAx + 20} y={148}>
        test
      </RowLabel>
      <ItemRow
        x={panelAx + 20}
        y={160}
        items={[
          { label: "Q1 · A", flagged: true },
          { label: "Q3 · H", flagged: false },
          { label: "Q3 · A", flagged: false },
          { label: "Q4 · A", flagged: true },
        ]}
      />

      <RowLabel x={panelBx} y={26}>
        Group-aware split
      </RowLabel>
      <rect
        x={panelBx}
        y={panelY}
        width={panelW}
        height={panelH}
        rx={14}
        fill="var(--color-surface)"
        stroke="var(--color-hairline)"
        strokeWidth={1.5}
      />
      <RowLabel x={panelBx + 20} y={64}>
        train
      </RowLabel>
      <ItemRow
        x={panelBx + 20}
        y={76}
        items={[
          { label: "Q1 · H", flagged: false },
          { label: "Q1 · A", flagged: false },
          { label: "Q3 · H", flagged: false },
          { label: "Q3 · A", flagged: false },
        ]}
      />
      <line
        x1={panelBx + 10}
        y1={124}
        x2={panelBx + panelW - 10}
        y2={124}
        stroke="var(--color-hairline)"
        strokeWidth={1.5}
      />
      <RowLabel x={panelBx + 20} y={148}>
        test
      </RowLabel>
      <ItemRow
        x={panelBx + 20}
        y={160}
        items={[
          { label: "Q2 · H", flagged: false },
          { label: "Q2 · A", flagged: false },
          { label: "Q4 · H", flagged: false },
          { label: "Q4 · A", flagged: false },
        ]}
      />
    </DiagramFigure>
  );
}
