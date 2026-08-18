---
title: The dtype that was not there
date: 2026-08-18
summary: I burned hours fixing hyperparameters that were never the problem, because the actual bug was a dtype the training config never controlled in the first place.
tags: ["debugging", "pytorch", "veritarach"]
draft: false
---

Training loss went NaN by step 50, the very first step that got logged, and it did that
every single time I ran the job.

I went through the obvious stuff first. Checked the precision setting in the training
config. Messed with the learning rate warmup. Turned off the dataloader workers, in case
something was racing. Forced the attention implementation to a plainer one. None of it
changed anything. Same NaN, same step, every time, which honestly should have told me
something a lot sooner than it did.

What all of that had in common: I was trusting the config instead of checking what the
model was actually doing. The training args said bf16, so in my head the model was running
in bf16, and I went looking for the bug everywhere except there.

Wrong. HuggingFace's `from_pretrained()` had loaded the checkpoint in float16, completely
separate from the bf16 flag I had set. Turns out that flag only controls autocast during
the actual compute, not what dtype the weights get loaded in. Float16 has way less range
than bf16, so things overflowed almost immediately and the loss collapsed to NaN on the
first logged step.

I only found this by printing `model.classifier.bias.dtype` after loading it and looking at
what came back. `torch.float16`. One line, after a few hours of guessing.

The fix is one keyword argument: pass `dtype=torch.float32` to `from_pretrained()` and it's
gone. The whole debugging session, including every failed attempt, cost about ninety cents
on a rented GPU, which is somehow the least annoying part of this story.

The part that actually stuck with me isn't the PyTorch specifics, it's that I spent hours
reasoning about what the config *said* instead of just checking what the program was
*doing*. The config is a request, not a guarantee, and nothing warned me it hadn't been
honoured. Now if something is behaving like it shouldn't be possible, I check the real
state first, before I touch a single hyperparameter.
