"use client";

import { useState } from "react";
import { Spinner, WarningCircle } from "@phosphor-icons/react";

type Verdict = {
  label: string;
  confidence: number | null;
  raw: unknown;
};

/**
 * Live demo against the deployed classifier.
 *
 * The service takes { text } on POST /predict. The response shape is read
 * defensively, because the field names are not part of any contract this site
 * controls, and a demo that breaks silently is worse than no demo.
 *
 * Only rendered when an endpoint is configured, so nothing ships broken.
 */
export function DetectorDemo({ endpoint }: { endpoint: string }) {
  const [text, setText] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function classify() {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setError(null);
    setVerdict(null);

    try {
      const response = await fetch(`${endpoint.replace(/\/$/, "")}/predict`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (response.status === 501) {
        throw new Error("The service is up but has no model checkpoint loaded.");
      }
      if (!response.ok) {
        throw new Error(`The service returned ${response.status}.`);
      }

      const data = await response.json();
      const record = (data ?? {}) as Record<string, unknown>;

      const label =
        typeof record.label === "string"
          ? record.label
          : typeof record.prediction === "string"
            ? record.prediction
            : typeof record.class === "string"
              ? record.class
              : "unknown";

      const rawConfidence = [record.confidence, record.score, record.probability].find(
        (value) => typeof value === "number",
      );

      setVerdict({
        label,
        confidence: typeof rawConfidence === "number" ? rawConfidence : null,
        raw: data,
      });
    } catch (caught) {
      // A blocked cross-origin request surfaces as a TypeError with no detail,
      // so it is called out by name rather than shown as "failed to fetch".
      setError(
        caught instanceof TypeError
          ? "Could not reach the service from this page. It may be down, or not sending CORS headers for this domain."
          : caught instanceof Error
            ? caught.message
            : "Something went wrong.",
      );
    } finally {
      setPending(false);
    }
  }

  const isHuman = verdict?.label.toLowerCase().includes("human");

  return (
    <div className="rounded-[26px] bg-surface p-6 ring-1 ring-hairline ring-inset sm:p-7">
      <label
        htmlFor="detector-input"
        className="font-display text-lg font-semibold tracking-tight text-ink"
      >
        Try it on some text
      </label>
      <p className="mt-1.5 text-[0.9rem] leading-relaxed text-muted">
        This calls the deployed model directly. Paste a paragraph and see what it says.
      </p>

      <textarea
        id="detector-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={5}
        placeholder="Paste a paragraph of text here."
        className="mt-4 w-full resize-y rounded-[18px] bg-paper p-4 text-[0.95rem] leading-relaxed text-ink ring-1 ring-hairline ring-inset outline-none placeholder:text-muted/70 focus-visible:ring-2 focus-visible:ring-accent"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={classify}
          disabled={pending || text.trim().length === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 font-display text-[0.92rem] font-medium text-accent-ink shadow-cta transition-transform duration-500 ease-soft hover:-translate-y-px active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45"
        >
          {pending ? (
            <>
              <Spinner size={15} weight="bold" aria-hidden className="animate-spin" />
              Checking
            </>
          ) : (
            "Check this text"
          )}
        </button>

        {text.trim().length > 0 ? (
          <span className="font-mono text-[0.72rem] text-muted">
            {text.trim().split(/\s+/).length} words
          </span>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-5 flex gap-2.5 rounded-[18px] bg-tint-2/70 p-4 text-[0.88rem] leading-relaxed text-muted"
        >
          <WarningCircle size={18} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-accent" />
          {error}
        </div>
      ) : null}

      {verdict ? (
        <div className="mt-5 rounded-[18px] bg-paper p-5 ring-1 ring-hairline ring-inset">
          <p className="font-mono text-[0.68rem] tracking-[0.15em] text-muted uppercase">
            Verdict
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink">
            {isHuman ? "Human written" : "AI generated"}
          </p>

          {verdict.confidence !== null ? (
            <p className="mt-1 font-mono text-[0.8rem] text-accent">
              {(verdict.confidence * 100).toFixed(1)}% confidence
            </p>
          ) : null}

          <p className="mt-4 text-[0.85rem] leading-relaxed text-muted">
            Worth testing with text from a model the classifier never trained on. It
            tends to return human with very high confidence in exactly that case, which
            is the generalization gap described above rather than a bug in this page.
          </p>
        </div>
      ) : null}
    </div>
  );
}
