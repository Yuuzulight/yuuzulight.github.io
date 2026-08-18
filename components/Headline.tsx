import { Fragment } from "react";

/**
 * Headline that rises word by word.
 *
 * Splitting happens on the server, so the full sentence is in the HTML and the
 * animation is pure CSS. The wrapper carries an aria-label with the original
 * text and the split spans are hidden from assistive tech, because inline-block
 * word fragments make some screen readers insert pauses mid-sentence.
 *
 * One word can be marked as the accent, which is set in weight and colour
 * rather than italic. The display face has no drawn italic, so an <em> here
 * would render as a browser-synthesised oblique.
 */
export function Headline({
  text,
  accent,
  className,
  step = 0.045,
  delay = 0,
}: {
  text: string;
  accent?: string;
  className?: string;
  step?: number;
  delay?: number;
}) {
  const words = text.split(" ");

  return (
    <span aria-label={text}>
      <span aria-hidden="true" className={className}>
        {words.map((word, index) => {
          // Trailing punctuation should stay outside the accent styling.
          const bare = word.replace(/[.,;:!?]+$/, "");
          const punctuation = word.slice(bare.length);
          const isAccent = accent !== undefined && bare === accent;

          return (
            <Fragment key={`${word}-${index}`}>
              <span
                className="word"
                // Rounded, or float noise serialises as 0.5549999999999999s.
                style={{ animationDelay: `${(delay + index * step).toFixed(3)}s` }}
              >
                {isAccent ? (
                  <>
                    <strong className="font-bold text-accent">{bare}</strong>
                    {punctuation}
                  </>
                ) : (
                  word
                )}
              </span>
              {index < words.length - 1 ? " " : null}
            </Fragment>
          );
        })}
      </span>
    </span>
  );
}
