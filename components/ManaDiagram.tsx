import { Arrow, ArrowLabel, BoxLabel, DiagramDefs, DiagramFigure, RowLabel, type Box } from "./DiagramKit";

const CLAIM =
  "Every request runs through models on the machine by default. Remote AI is wired in but ignored unless it is explicitly turned on, so nothing leaves the machine unless that switch is flipped.";

/**
 * Adapted from the architecture diagram in Mana's own README, redrawn in
 * this site's tokens rather than reusing its dark, multi-hue palette (this
 * page keeps one accent color, reserved for the one thing that matters).
 * That one thing here is the local versus remote boundary: local runtime is
 * always reachable, remote AI exists in the codebase and stays dormant until
 * someone turns it on. The gate gets the accent and the dashed border;
 * everything upstream of it is neutral.
 */
export function ManaDiagram() {
  const a1: Box = { x: 40, y: 36, w: 380, h: 64 };
  const a2: Box = { x: 460, y: 36, w: 380, h: 64 };
  const b: Box = { x: 40, y: 170, w: 800, h: 84 };

  const runtimeW = 188;
  const runtimeGap = 16;
  const runtimeY = 324;
  const runtimeH = 100;
  const runtimeX = [40, 40 + runtimeW + runtimeGap, 40 + 2 * (runtimeW + runtimeGap), 40 + 3 * (runtimeW + runtimeGap)];

  const d: Box = { x: 40, y: 494, w: 800, h: 76 };

  return (
    <DiagramFigure viewBox="0 0 880 620" ariaLabel={CLAIM} claim={CLAIM}>
      <DiagramDefs idPrefix="mana" />

      <RowLabel x={40} y={24}>
        Clients
      </RowLabel>
      <BoxLabel box={a1} title="windows-launcher" subtitle="Electron · mic capture · avatar overlay" />
      <BoxLabel box={a2} title="desktop-client" subtitle="Electron · packaged installer" />

      <Arrow idPrefix="mana" x1={230} y1={100} x2={230} y2={170} />
      <Arrow idPrefix="mana" x1={650} y1={100} x2={650} y2={170} />
      <ArrowLabel x={440} y={138} anchor="middle">
        same local backend, port 5005
      </ArrowLabel>

      <RowLabel x={40} y={158}>
        Backend
      </RowLabel>
      <BoxLabel
        box={b}
        title="node-bot, local backend"
        subtitle="request routing, tool-calling loop, memory, persona"
      />

      <Arrow idPrefix="mana" x1={440} y1={254} x2={440} y2={324} />
      <ArrowLabel x={455} y={292} anchor="start">
        invoked as needed
      </ArrowLabel>

      <RowLabel x={40} y={312}>
        Local runtime
      </RowLabel>
      <BoxLabel
        box={{ x: runtimeX[0], y: runtimeY, w: runtimeW, h: runtimeH }}
        title="Brain"
        subtitle="llama.cpp, local LLM"
      />
      <BoxLabel
        box={{ x: runtimeX[1], y: runtimeY, w: runtimeW, h: runtimeH }}
        title="Ears"
        subtitle="whisper.cpp, local STT"
      />
      <BoxLabel
        box={{ x: runtimeX[2], y: runtimeY, w: runtimeW, h: runtimeH }}
        title="Voice"
        subtitle="local TTS + lip-sync"
      />
      <BoxLabel
        box={{ x: runtimeX[3], y: runtimeY, w: runtimeW, h: runtimeH }}
        title="Presence"
        subtitle="Live2D + screen OCR"
      />

      {/* The one gate worth drawing. Dashed and accent-colored, since it is
          off by default rather than a normal step in the flow. */}
      <Arrow idPrefix="mana" x1={440} y1={424} x2={440} y2={494} accent dashed />
      <ArrowLabel x={455} y={462} color="var(--color-accent)">
        explicit opt-in only
      </ArrowLabel>

      <RowLabel x={40} y={482}>
        Remote, off by default
      </RowLabel>
      <BoxLabel
        box={d}
        title="Remote AI"
        dashed
        subtitle="API keys are ignored unless the opt-in flag is set. Nothing leaves the machine otherwise."
      />
    </DiagramFigure>
  );
}
