---
title: The dtype that was not there
date: 2026-08-18
summary: Five hypotheses in a row failed to explain a NaN training loss. The cause was a config flag that never controlled the thing it claimed to.
tags: ["debugging", "pytorch", "veritarach"]
draft: false
---

Training loss went to NaN almost immediately. Not after a few hundred steps, not on a
particular batch. Immediately, and every time.

I had a reasonable list of suspects, and I worked through it in order. The precision
setting in the training config. Learning rate warmup. Dataloader workers. The attention
implementation. Each one was plausible, each one had a story attached about why it would
produce exactly this failure, and each one was wrong.

What all five had in common is that I was reading configuration and reasoning about what
it implied. The config said bf16. So the model was in bf16, and the problem must be
somewhere else. That inference felt so obviously safe that I never checked it.

The model was in float16. `from_pretrained()` had loaded the weights in half precision,
independently of the training flag that was supposed to control precision. The two settings
looked like they described the same thing, and they did not. Half precision has a much
smaller range than bfloat16, the intermediate values overflowed, and the loss went to NaN
on the first step.

I found it by printing the dtype of a loaded tensor. That is the entire diagnostic. One
line, after some hours of building increasingly elaborate theories about optimiser state.

The fix was a single explicit parameter. What stayed with me is the shape of the mistake,
because it is not really about precision or about PyTorch. Every one of my five hypotheses
was a guess about runtime behaviour, checked against configuration rather than against the
runtime. Configuration is a statement of intent. It is a request. Whether the request was
honoured is a separate question, and on that day the answer was no, silently, with no
warning printed anywhere.

Now when something behaves impossibly, the first thing I do is ask the running program what
it actually is, rather than asking the config what it was told to be. It is a slower first
step and it has saved me considerably more time than it costs.
