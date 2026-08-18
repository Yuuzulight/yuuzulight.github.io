---
title: The touch targets an audit could not see
date: 2026-08-18
summary: An automated mobile audit found fourteen controls too small to tap. It also missed three more, because an audit can only see the state it happens to load in.
tags: ["euphonia", "accessibility", "mobile"]
draft: false
---

An automated pass over Euphonia's phone layout turned up fourteen controls sitting
under the 44px touch target floor. The theme and settings buttons at 34px square, a
modal close button at 26px, reference markers on the acoustic charts at 3 by 16. The
fix for most of them was straightforward: grow the hit area under `(pointer: coarse)`
rather than gating on screen width, because a 34px button is wrong under a thumb
regardless of how wide the viewport is, and fine under a mouse regardless of width too.
Width was never the variable that mattered.

The reference markers needed more care than a blanket 44px square would give them. A
naive 44px hit area on a marker just 3px wide swallowed its neighbours, since measured
gaps between adjacent markers on the chart ran as small as 0.6px. Growing the tap
target had made the markers *harder* to use individually, not easier. The fix was a
narrower overlay, 14 by 44 rather than 44 by 44, still centered, still invisible, still
generous in the one dimension that doesn't collide with a neighbour.

Then the audit reported clean, and three more broken controls surfaced anyway. All
three only exist once a clip is actually playable, so no audited page state ever
contained them at all: a take's clickable variant, a player's close button, its volume
slider. An audit that never plays a clip can't fail on a control it never sees, and it
also can't pass on one. It just never gets an opinion.

The more uncomfortable find was in the README, not the code. It claimed phone-sized
screens had been tested, with only microphone capture called out as unverified. That
wasn't true. The populated dashboard had never actually been looked at, at any width.
`recordings.json` ships empty in the test fixture, so every "mobile" screenshot on file
was a screenshot of an empty page, which is exactly how a chart label rendering at 3px
went unnoticed for as long as it did. The README now says what was actually checked,
by what, and states plainly that a resized browser window emulating a phone is not the
same thing as a phone.

That's the part worth keeping. Viewport emulation and an automated contrast pass will
tell you a lot, but they only ever report on the states you thought to put in front of
them. The gaps that matter most are usually the ones nobody thought to check, and
"the audit passed" is not the same claim as "someone looked."
