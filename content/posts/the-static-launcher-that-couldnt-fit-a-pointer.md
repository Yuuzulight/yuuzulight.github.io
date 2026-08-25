---
title: The static launcher that couldn't fit a pointer
date: 2026-08-25
summary: Mana's fish-speech TTS server ran under WSL2 because torch.compile was supposedly unsupported on native Windows. It wasn't unsupported, it was two specific bugs, and fixing them left native Windows faster than the VM it replaced.
tags: ["mana", "debugging", "machine-learning"]
draft: false
---

Mana's docs for the S1-mini TTS server were blunt about it: "the official setup path is
separate from Mana and needs WSL2 (native Windows is not supported upstream) plus a CUDA
GPU." I'd taken that at face value for a while, running a Linux VM just to compile a model
that otherwise talks to Mana over plain HTTP. Upstream's own claim was that `torch.compile`
didn't work on native Windows. I hadn't actually checked what "didn't work" meant, so I
went and ran it.

It failed twice, in two unrelated ways. The first was a version mismatch: `triton-windows`,
the community Windows build of Triton that `torch.compile` needs, has to be pinned to the
exact release matching the installed PyTorch build. A newer `triton-windows` has a
different internal API and breaks silently with an `ImportError` about `triton_key`, not an
error that points anywhere near "wrong version."

The second was the one that actually earned the title. With a matching `triton-windows`
installed, compilation itself worked, but the first real inference call under
`--compile`'s `reduce-overhead` mode (CUDA graphs) threw `OverflowError: Python int too
large to convert to C long`. `torch._inductor`'s newer "static" CUDA launcher path passes a
64-bit GPU pointer into a plain Windows `long`, which is 32 bits. Not a fish-speech bug,
not a driver problem, a launcher that assumes a pointer width Windows doesn't have. Setting
`torch._inductor.config.use_static_cuda_launcher = False` before the model loads falls back
to the normal, still fully-compiled kernel launcher, and the overflow is gone.

Both fixes went into `tools/fish_speech_native_server.py`, a thin wrapper that sets that
config flag, then hands off to fish-speech's own unmodified `tools/api_server.py` via
`runpy.run_module`. The vendored `api_server.py` stays untouched since it lives in a git
submodule. `start_fish_speech_native.ps1` starts it and polls `/v1/health` for up to six
minutes, long enough to cover a cold compile trace.

Then I measured it against the same `--compile` code path in WSL2, on the same RTX 5080.
Native Windows came out 1.3-1.8x faster for actual synthesis, and released VRAM immediately
on exit instead of holding it pinned to a VM. Without `--compile`, native Windows text-to-
semantic generation measured RTF ~2.7, about 2.7 seconds of compute per second of audio,
too slow for anything real-time. With it, steady-state RTF dropped to ~0.22-0.42 depending
on sentence length, a 6-12x speedup, at the cost of a one-time compile trace: 150-255
seconds cold, about 12 seconds once the on-disk inductor cache is warm from a prior run.
It's still batch-style generation, not live conversational voice, and Kokoro stays the
default for that.

The thing I keep relearning is that "not supported" in a doc or an issue tracker is a
claim about the state someone left it in, not a property of the software. It cost about an
evening to find out this one was two narrow, fixable bugs wearing a much bigger-sounding
label. I'd rather spend that evening than keep paying a VM tax on every run because nobody
went back to check.
