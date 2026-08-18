/**
 * Persistent background wash, mounted once in the root layout so it sits
 * behind every page. `z-index: -1` and `overflow: hidden` on the wrapper
 * (see .ambient-bg in globals.css) keep it from ever expanding the
 * document's scrollable area or landing above real content. Purely
 * decorative: aria-hidden, no pointer events, and the two blobs are the
 * only things this component renders.
 */
export function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-b" />
    </div>
  );
}
