/**
 * Persistent background wash, mounted once in the root layout so it sits
 * behind every page. `z-index: -1` and `overflow: hidden` on the wrapper
 * (see .ambient-bg in globals.css) keep it from ever expanding the
 * document's scrollable area or landing above real content.
 *
 * Each blob is two stacked gradient layers, cool and warm, that cross-fade
 * via opacity as the page scrolls, giving the appearance of a color shift
 * without ever animating an actual color value (see globals.css for why).
 * Purely decorative: aria-hidden, no pointer events.
 */
export function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-blob ambient-blob-a">
        <div className="ambient-blob-layer ambient-blob-a-cool" />
        <div className="ambient-blob-layer ambient-blob-a-warm" />
      </div>
      <div className="ambient-blob ambient-blob-b">
        <div className="ambient-blob-layer ambient-blob-b-cool" />
        <div className="ambient-blob-layer ambient-blob-b-warm" />
      </div>
    </div>
  );
}
