---
title: The draft model that needed its own GPU flag
date: 2026-08-22
summary: Wiring draft-model speculative decoding into Mana's llama.cpp runtime, I measured a 5x regression from a flag I never touched. The draft model's own "auto" GPU-offload default was quietly leaving it mostly on CPU.
tags: ["mana", "llm", "performance"]
draft: false
---

Mana's `node-bot/ai/llama-server-runtime.js` builds the flags for llama.cpp's server, and
issue #332 asked me to wire up two forms of speculative decoding: n-gram, which needs no
extra model, and draft-model, which runs a small model ahead of the real one and lets the
target verify its guesses in bulk when they're right. Draft-model needed one new flag,
`--spec-draft-model`, pointing at a small same-family model. Everything else, the issue's
own scope note said, should stay at its default unless a real measurement showed it
underperforming. So I left `-ngld` (`--spec-draft-ngl`, the draft model's own GPU-layer
offload count) on its own `auto` default and shipped it.

Then I actually measured it, with a real coder-7B target and a same-family 1.5B draft
model on the same GPU as always. No-draft baseline: 97.4 tok/s. With draft-model
speculative decoding enabled, `-ngld auto` and all: 14.6 tok/s. Not a small regression, a
sixth of the baseline. Token acceptance was fine, 93%, which ruled out the model pairing
being the problem. What was left was where the tokens were actually running, and `-ngld
auto` was leaving the draft model mostly off-GPU while the target sat fully offloaded on
`-ngl 99`. Every draft step was paying full CPU-to-GPU latency for a model that's supposed
to be the fast, cheap half of the pipeline.

The fix was one flag: pin `--spec-draft-ngl` to whatever `-ngl` already resolved to,
instead of trusting the draft model's own auto-detection to land somewhere sane next to
it. Forcing them to match recovered most of the loss, 78.7 tok/s, up from 14.6.

It's still not a win. 78.7 tok/s with the draft model enabled is still slower than 97.4
tok/s with it off entirely, on this single-GPU setup, even at a 93% acceptance rate that
should favor speculative decoding. So draft-model speculative decoding stays opt-in in
Mana rather than becoming a new default; the measurement didn't clear that bar and I'm not
writing it down as if it did. What the fix earns is narrower and still real: a caller who
does turn it on now pays speculative decoding's actual, expected cost instead of an
unrelated 5x tax from a GPU-offload flag nobody told them to check.

The part worth remembering isn't the flag itself, it's what "leave it at its default"
quietly assumed. The issue's scope note was reasonable on its face, tune only what
measurement shows needs tuning, don't preemptively touch knobs you have no evidence
about. But a component's own "auto" default is only safe to trust when that component is
reasoning about the same resources everything else is. `-ngld auto` wasn't wrong in
isolation; it just had no way to know a 99-layer target had already claimed the GPU it was
trying to auto-detect space on. Two independently-reasonable defaults, evaluated
independently, can still add up to a measured 5x regression that neither default's author
would have predicted from their own flag alone.
