---
title: The engine swap that won on memory and lost on two functions
date: 2026-09-04
summary: I evaluated swapping Mana's browser-automation plugin from Playwright+Chromium to the lighter Obscura engine. The memory numbers were real, 15x lower RSS, but the existing test suite couldn't have told me that, and the engine itself failed on the two functions the plugin depends on most.
tags: ["mana", "debugging", "machine-learning"]
draft: false
---

Issue #508 asked a fair question: `plugins/browser-automation/` drives a full headless
Chromium instance through Playwright just to click things and read text off a page.
Obscura is a Rust-based headless engine that speaks the same CDP protocol and claims much
lower memory, binary size, and startup time. The proposed scope said to swap-test it
against the plugin's existing `plugins/browser-automation/test/` suite for correctness
parity, then measure the resource numbers for real.

The correctness half of that plan doesn't work, and the reason is written into the file
it would have tested. `browser-automation.js`'s own header comment explains why the
module is testable at all: production wraps a real Playwright page, but the test suite
injects a plain fake object by design, so every existing test exercises `createBrowserSession()`'s
wrapper logic against a fake, never a real browser. Pointing that suite at Obscura instead
of Chromium wouldn't have shown a single thing about whether the two engines actually
behave the same, because the suite was never looking at engine behavior in the first
place.

So I drove `createBrowserSession()` itself, the real production wrapper, against a real
headless Chromium and a real Obscura 0.2.1 CDP server, both pointed at the same local test
page. The resource claims held up and then some: about 47MB total RSS including child
processes versus about 725MB for Chromium, roughly 15x lower, and 6-10x faster startup.
If this were only about memory, the recommendation would be easy.

It isn't only about memory. Two real correctness gaps turned up, and both landed on
exactly the two functions the plugin depends on most. `snapshotInPage()` is what finds
every clickable thing on a page and hands the model a `ref` for each one; against Obscura
it missed a plain `<a href>` link that real Chromium picked up without issue, which means
a link that exists and is visible would simply not be in the list the model gets to act
on. `extractTextInPage()` is the other half, `document.body.innerText` sliced to
`MAX_PAGE_TEXT_CHARS`, the plain text budget this file's own comment says exists specifically
so the model never has to read raw HTML. Under Obscura, that extraction leaked raw
`<script>` tag source straight into the output, the exact kind of content the function
exists to keep out, and the exact thing that gets fed to the model on every snapshot.

Recommendation: don't swap. The memory and startup case is real and worth tracking, but
these aren't edge cases you'd only hit on unusual pages. A missing link breaks ordinary
automation, and leaked script source pollutes model context on any page that has a
`<script>` tag, which is nearly all of them.

The part worth keeping is the first half, not the second. A correctness comparison is
only as good as whatever it actually points at, and a test suite built to be fast by
faking the browser away can't turn around and referee a real-browser question just
because someone points it at a different target. If the thing under test was designed
out of the harness on purpose, checking it back in is its own step, not a rerun.
