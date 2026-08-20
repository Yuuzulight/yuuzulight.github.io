---
title: The quantization that won on exactly one bug
date: 2026-08-21
summary: I calibrated a custom quantization of Mana's coding model on real project code instead of generic text. Checked it honestly against the plain community quant across six prompts, two ties, one loss, two minor edges, and exactly one real correctness win.
tags: ["mana", "quantization", "llm"]
draft: false
---

Mana's `coding` profile ran the plain community Q4_K_M quant of
Qwen2.5-Coder-7B-Instruct, the one everyone downloads, calibrated by whoever built it
against generic text like wikitext. A Q4_K_M quant isn't just "the model, but smaller."
It's built from an importance matrix that decides which weights get to keep more
precision, and that decision is only as good as the text it's calibrated against. Generic
prose calibration optimizes for generic prose and generic code. Mana's coding profile's
actual job is narrower than that: ACP tool-calling in Mana's exact schema, plus whatever
languages the user's other real projects use. So I built my own imatrix from a corpus
that matches that job specifically: Mana's own ACP bridge code, 24 real files across its
backend, six real commit diffs, and a language sample pulled from the user's actual other
projects (TypeScript/React, Python, SQL, C++, PowerShell). Same Q4_K_M tier, same
~4.68GB, same everything except what the imatrix was shown.

The pipeline itself was quick once it was running right: imatrix generation over 320
chunks, final perplexity 4.6370 ± 0.0432, about four minutes fully GPU-accelerated. The
catch is in "fully GPU-accelerated." Any VRAM contention forces partial CPU offload,
which turned an estimated five minutes into a projected twelve-plus hours in an early
attempt, three orders of magnitude for one resource being half-available instead of
fully available. The actual quantize step after that, applying the finished imatrix to
the fp16 source, took about 103 seconds.

Then the part that mattered more than the pipeline: checking whether any of it made a
real difference. Six prompts, one per category in the corpus, same seed and temperature,
run through both quants side by side. The tool-schema tie makes sense on reflection, a
quantization pass can't teach the base model a structural fact it never learned; it can
only shift precision toward patterns the model already has.

| Prompt | Verdict |
| --- | --- |
| ACP tool schema | Tie, neither reproduced the real nested shape |
| Python (pydantic) | Slight edge: custom |
| TypeScript/React (`CountUp`) | Clear win: custom |
| SQL (dbt model) | Slight edge: generic |
| C++ (Win32 monitor resolution) | Wash |
| Diff formatting | Minor edge: custom |

The one loss stung a little: SQL went to the generic quant because the custom one added
an unneeded `GROUP BY` and got cut off by the token budget. Two ties, and two edges too
small on their own to build a claim on.

The one that mattered was a React `CountUp` component. The generic quant reached for a
`setInterval`-based animation, which breaks for large target values or short durations,
an actual bug, not a style choice. The custom quant wrote a correct
`requestAnimationFrame` plus elapsed-time interpolation, matching the real `CountUp.tsx`
pattern that happened to be sitting in the corpus. That's not a stylistic preference
either quant could have gone either way on. It's the calibration data doing exactly what
it was supposed to do, moving precision toward a pattern the model would actually be
asked to reproduce, and it landing on the one prompt in six built to test that.

Net: three wins or edges for the custom quant, one for generic, two ties. Six prompts,
not a benchmark suite. I wrote that down as plainly as the result itself,
because a custom quantization pipeline is exactly the kind of project that tempts you to
oversell it once you've spent an afternoon on it. The honest version is smaller: don't
expect this to feel dramatically smarter day to day. Expect it to be slightly more
reliable on the patterns the corpus was actually built from, with an occasional real win
like the one it just had. That's a fair trade for the afternoon, and it's a more useful
thing to have written down than a number that isn't real.
