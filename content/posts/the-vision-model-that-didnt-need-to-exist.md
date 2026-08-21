---
title: The vision model that didn't need to exist
date: 2026-08-21
summary: I'd just spent VRAM swapping Mana's vision model to a smaller one to free headroom. A same-day benchmark run, done for an unrelated reason, showed the chat model already beat both vision candidates outright, so I deleted the second model instead of picking a winner.
tags: ["mana", "llm", "benchmarking"]
draft: false
---

Mana runs chat and vision through the same `llama-server` process, but until this week
they were two different model files: `LLAMA_MODEL` for text, `LLAMA_VISION_MODEL` for
images. Asking about an image swaps the loaded weights to the vision model; the next text
message swaps back. Each swap costs one model load.

Earlier the same day I'd already made one change to this stack: chat/quality moved from
Qwen3-14B to Qwen3.5-9B, a newer generation that scores higher on every directly
comparable benchmark, MMLU-Redux, GPQA-Diamond, C-Eval, IFEval, at 5.68GB instead of
9.00GB, not a size/quality trade at all. Vision moved from Qwen2.5-VL-7B down to
Qwen3-VL-4B, freeing about 2.9GB of VRAM for a feature that only runs through an
occasional hotkey. That felt like a reasonable trade at the time: give up some vision
quality tier for headroom on something used rarely.

Then, benchmarking Qwen3.5-9B against vision candidates for an unrelated reason, I ran it
against the just-installed Qwen3-VL-4B and a second candidate, Gemma 4 E4B, on general
chat. A 5-prompt spot check came back a tie, not enough to decide anything, so I ran a
real benchmark instead: MMLU-Pro (168 questions) and GSM8K (120 questions), self-scored at
the actual deployed Q4_K_M quantization rather than a full-precision number production
would never see. Qwen3.5-9B beat Gemma 4 E4B by 11.3 points on MMLU-Pro and 3.3 on GSM8K.
And somewhere in comparing these three files, it turned out Qwen3.5-9B, Mana's *chat*
model, not a vision candidate at all, is natively multimodal, unlike Qwen3, which needed a
separate `-VL` build. Tested directly against screenshots, its vision quality beat both
Qwen3-VL-4B and Gemma 4 E4B, the two models I'd actually been trying to choose between.

So the fix wasn't picking a winner. It was deleting the vision model slot entirely: point
`LLAMA_VISION_MODEL` and `LLAMA_VISION_MMPROJ` at the same file as `LLAMA_MODEL`. That
took one extra step, since Qwen3.5-9B's filename doesn't contain a token like `vl` or
`gemma-4` that vision auto-detection looks for, so the consolidation had to be wired
explicitly in `.env` rather than picked up automatically. Chat and vision now share one
already-loaded model. No swap, no second model load, ever.

I also filed an issue instead of building something. Both models handle audio and video to
some degree, and neither maps to anything Mana's architecture currently uses: speech-to-text
already covers "what did the user say," and vision is a single-frame, on-demand hotkey, not
a video stream. "The model can technically do it" isn't a justification for a pipeline that
has no caller yet, so that stays open as issue #439 instead of becoming code.

What sticks with me is that I'd already closed the vision decision that morning, with a
trade-off that made sense given what I'd checked. It would have shipped as final if I
hadn't happened to benchmark that same chat model again, a few hours later, for something
else entirely. The first swap wasn't wrong given what I knew going in; it was incomplete
given a question I hadn't thought to ask yet, whether the model already running for chat
had quietly made the whole second model unnecessary. A model upgrade is worth re-testing
against, not just choosing between the alternatives already on the table.
