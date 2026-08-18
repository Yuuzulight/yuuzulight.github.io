"use client";

import { useState } from "react";
import { capturedOnLabel, detectorSamples } from "@/content/detector-samples";

/**
 * Browsable set of real responses from the deployed classifier.
 *
 * Recorded rather than live, for three reasons: a live widget would publish the
 * server's address, it would leave an unauthenticated model open to anyone, and
 * it would break the day the box goes away. The values here came from calling
 * the service directly, so they are the model's actual output.
 */
export function DetectorSamples() {
  const [activeId, setActiveId] = useState(detectorSamples[0].id);
  const active = detectorSamples.find((s) => s.id === activeId) ?? detectorSamples[0];

  const saidAi = active.verdict === "ai_generated";
  const missed = !active.correct;

  return (
    <div className="rounded-[26px] bg-surface p-6 ring-1 ring-hairline ring-inset sm:p-7">
      <p className="font-display text-lg font-semibold tracking-tight text-ink">
        What the model actually says
      </p>
      <p className="mt-1.5 text-[0.9rem] leading-relaxed text-muted">
        Six passages, three written by a person and three by a language model. Pick
        one to see the response the deployed service returned for it.
      </p>

      <div role="group" aria-label="Sample passages" className="mt-5 flex flex-wrap gap-2">
        {detectorSamples.map((sample, index) => (
          <button
            key={sample.id}
            type="button"
            aria-pressed={sample.id === activeId}
            onClick={() => setActiveId(sample.id)}
            className={`min-h-11 rounded-full px-4 font-display text-[0.85rem] font-medium transition-transform duration-500 ease-soft active:scale-[0.985] ${
              sample.id === activeId
                ? "bg-accent text-accent-ink shadow-cta"
                : "bg-surface-2 text-ink hover:-translate-y-px"
            }`}
          >
            {sample.truth === "ai" ? "AI" : "Human"} {index + 1}
          </button>
        ))}
      </div>

      <figure className="mt-5">
        <figcaption className="font-mono text-[0.68rem] tracking-[0.15em] text-muted uppercase">
          {active.caption}
        </figcaption>
        <blockquote className="mt-2.5 rounded-[18px] bg-paper p-4 text-[0.92rem] leading-relaxed text-ink ring-1 ring-hairline ring-inset">
          {active.text}
        </blockquote>
      </figure>

      <div
        aria-live="polite"
        className={`mt-4 rounded-[18px] p-5 ring-1 ring-inset ${
          missed ? "bg-tint-2/70 ring-accent/30" : "bg-paper ring-hairline"
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-mono text-[0.68rem] tracking-[0.15em] text-muted uppercase">
            Model returned
          </p>
          <p className="font-mono text-[0.72rem] text-muted">
            actually {active.truth === "ai" ? "AI generated" : "human written"}
          </p>
        </div>

        <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink">
          {saidAi ? "AI generated" : "Human written"}
          <span className="ml-2.5 font-mono text-sm font-normal text-accent">
            {(active.confidence * 100).toFixed(2)}%
          </span>
        </p>

        <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
          {missed
            ? "Wrong, and confident about it. This is the generalization gap described above: text from a model it did not train on comes back as human, usually at very high confidence."
            : "Correct. The classifier is reliable on text that resembles what it was trained on."}
        </p>
      </div>

      <p className="mt-4 text-[0.82rem] leading-relaxed text-muted">
        These are recorded responses, captured on {capturedOnLabel}, not a live call. It got{" "}
        {detectorSamples.filter((s) => s.correct).length} of {detectorSamples.length} right.
        The same behaviour at scale is what{" "}
        <a
          href="https://github.com/Yuuzulight/Veracia"
          target="_blank"
          rel="noreferrer noopener"
          className="text-accent underline underline-offset-4"
        >
          Veracia
        </a>{" "}
        measured.
      </p>
    </div>
  );
}
