---
title: Sales are not a time series until you make them one
date: 2026-08-18
summary: Mana's market tools could already tell you what something is worth right now. Teaching it to forecast meant turning a scatter of irregular sale events into something a model could actually read.
tags: ["mana", "forecasting", "data-engineering"]
draft: false
---

The market tools in Mana already answered one question well: what is this worth right
now. Adding a forecast meant answering a harder one, where is it heading, and that
exposed a gap I hadn't noticed. Real sale events are not a time series. They're a
scatter of irregular points, sometimes several in an hour, sometimes none for three
days, and a forecaster needs a regular sequence to reason over.

The first thing I had to correct was my own assumption about the input. I'd assumed the
plugin already accumulated enough history locally, so no new fetching would be needed.
Half right: it does fetch history, but with `?listings=5&entries=5`, which is plenty
for the median price it already computes and nowhere near enough for a forecast. The
request needed to ask for far more.

Turning that history into something usable meant a few decisions that only look small
in isolation. Sales get bucketed by day and reduced to a median within each bucket, so
one absurdly priced listing doesn't drag the whole day's number with it, and market
data is full of those. A day with no sales carries the previous price forward rather
than reading as zero, because a gap means nobody sold one, not that the item became
worthless overnight, and a forecaster fed a zero would learn the wrong lesson from it.
Leading gaps get dropped entirely instead of padded, since a series should start where
the data actually starts.

The part I was most careful about is the one a forecaster can't self-report: coverage.
A series built from three real observations and twenty-seven carried-forward values
produces a confident, flat-looking line, and that line is lying about how much it
actually knows. Coverage rides alongside every forecast so whoever's looking at it can
tell the difference between "the market is stable" and "we barely have any data."

The model itself is TimesFM 2.5 at 200M parameters, running one-shot on CPU in its own
virtual environment, and getting it running surfaced two things I only found by
actually running it. `torch.compile` fails outright without MSVC's `cl.exe` on
Windows, so compilation stays off rather than chasing a build toolchain a desktop
assistant has no business requiring. And a 200M parameter model on CPU is slow enough
that it earns its own isolated environment rather than living in the same process as
everything else Mana is doing at once.

None of this is complicated math. It's the unglamorous work of making sure the numbers
going into a model mean what the model will assume they mean, which is most of what
forecasting actually is once you get past the part where you pick a model.
