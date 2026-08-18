---
title: The checkpoint that was quietly guessing
date: 2026-08-15
summary: The deployed classifier looked fine until I loaded the checkpoint directly and asked it about the first line of Pride and Prejudice. It barely had an opinion.
tags: ["debugging", "pytorch", "veritarach"]
draft: false
---

I loaded the checkpoint straight from disk, no network layer, no service in between, and
asked it to classify the opening line of *Pride and Prejudice*. Human-written, about as
unambiguous as text gets. Confidence: 0.54. I tried a one-sentence explanation of
mitochondria. 0.56. The model barely had an opinion about either one.

That is not what a converged classifier looks like. The live droplet gave the same
answer, so this was not a deployment mismatch, a stale container, or a config drift
between local and production. I checked file timestamps to be sure: the droplet's
checkpoint was a direct copy of the same broken file I was holding locally. Whatever was
wrong had been wrong since training.

Root cause, found by actually renting a GPU and watching the run rather than guessing
from the logs: the instance's driver only supported CUDA 12.4, but the pinned torch
build defaults to a CUDA 13 wheel on Linux. `torch.cuda.is_available()` silently
returned `False`. Training proceeded thinking it had a GPU when it did not, and with
`report_to=[]` and no saved metrics, nothing was watching closely enough to catch it at
the time. It just ran, finished, and produced a checkpoint that looked like a model.

Retrained on an instance with a compatible driver. This time it converged the way a
real training run does: 99.86% test F1. I did not take that number on faith either.
Verified it three separate ways: `test_metrics.json`, ten out of ten correct on real
held-out rows loaded straight from the checkpoint, and six out of six correct hitting
the live, redeployed endpoint after the swap.

One thing the retrain did not fix, and I am not leaving it implied this time: the model
is genuinely good on its own training distribution and confidently wrong outside it.
Prose paragraphs, casual notes, anything that does not look like the HC3-style Q&A and
Wikipedia text it trained on, and it will call AI-written text human without hesitating.
That belongs in the README next to the F1 number, not somewhere a reader has to go
looking for it.

I also left `miner.yaml` alone. That file is meant to be an exact record of what was
actually pinned to IPFS and submitted back on 2026-08-13, and quietly bumping the F1
figure in it would misrepresent history rather than correct it. Added a dated note
next to it instead. If the number changes, the record of what changed and why should
change with it, not paper over what was there before.

The lesson is the same one dtype bug taught me, just wearing a different costume this
time: a checkpoint is not a claim about what happened, it is a file. If you want to know
what a model actually learned, load it and ask it something you already know the answer
to.
