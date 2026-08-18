---
title: The forecast gate I almost got wrong
date: 2026-08-17
summary: I guessed a rule for when Hecate's forecasts were trustworthy enough to show. The guess was wrong. Testing it against real data gave me a better one, and testing didn't stop once the feature shipped.
tags: ["forecasting", "hecate", "data-engineering"]
draft: false
---

Before I added forecasting to Hecate, I had a rule of thumb in my head: a repository
needs at least twice the forecast horizon in observed history before I'd trust a
prediction for it. Twice the horizon, so a 7-day forecast wants 14 days of data. It
sounded reasonable. I did not check it against anything.

So before building the feature around it, I spiked TimesFM, Google's zero-shot
time-series model, against real npm download-count series and measured where it
actually stopped being better than a naive baseline. The heuristic was wrong in the
useful direction: at 8 days of context it already clears a 20%-better-than-naive bar,
and by 14 days it clears it decisively, 58.7% improvement with 80.7% quantile
calibration. The real gate is looser than my guess, which meant the guess would have
been quietly hiding forecasts I could have shown. I only tested the 7-day horizon
that way, so the 30-day gate still runs on the untested heuristic, and it's labelled
as such rather than dressed up as evidence it isn't.

A few other decisions came out of the same instinct to check rather than assume.
The model outputs quantiles, not a single point estimate, so a repository's own
uncertainty shows up as band width instead of getting flattened into one confident
number. Forecasts that don't clear the gate get written as NULL rather than omitted,
matching a convention already used elsewhere in the project: NULL means "we chose not
to guess," not "there is nothing here." And every forecast run writes through three
separate verification layers, because a job that logs success and a job that actually
did the right thing are not always the same job.

That last point turned out to matter almost immediately. Four real bugs surfaced
while building this, all caught by running the code against real data rather than by
tests passing: a backwards `ORDER BY` from a bad assertion, a missing package in the
forecast image's requirements file, a numpy version pinned for the wrong Python, and
one more after the feature had already merged. The daily job's container image tag
didn't match what got built, so the scheduled run never actually happened. It logged
nothing, because there was nothing running to log. The first real forecast only landed
the following day, once the tag was fixed and I confirmed a full run end to end rather
than trusting that a merged PR meant a working pipeline.

None of these were exotic bugs. They were the ordinary kind that "the tests pass" does
not catch, because the tests were testing the code, not the deployed thing running it.
Shipping the feature was the easy half. Watching it actually forecast something on a
real schedule was the part that told me it worked.
