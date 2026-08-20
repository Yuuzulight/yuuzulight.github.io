---
title: The conversion function that existed twice
date: 2026-08-20
summary: Argos already had a correct UTF-8-to-UTF-16 helper. It was invisible to the one place that needed it, so that place quietly reinvented a broken one, and consolidating the two surfaced a second bug for free.
tags: ["argos", "cpp", "debugging"]
draft: false
---

Argos's `Measure.cpp` had a `ToWide()` helper that did the conversion correctly: call
`MultiByteToWideChar(CP_UTF8, ...)` to get the required buffer length, allocate, convert,
and trim the trailing null the Windows API counts as part of the length. It was declared
inside an anonymous namespace, which in C++ means only that translation unit can see it,
so `skin_demo.cpp`, which needed to show a failed-skin-load error in a `MessageBoxW`, had
no way to call it.

What `skin_demo.cpp` did instead was `std::wstring(loaded.error.begin(),
loaded.error.end())`, a byte-for-byte widening that treats each UTF-8 byte as its own
UTF-16 code unit. That's correct only for the ASCII subset, and a skin-loading error is
exactly the kind of string likely to quote a path or a section name someone typed, which
is exactly the kind of string likely to contain a character outside ASCII eventually. It
wouldn't crash. It would just render as garbage the one time it mattered.

Fixing it meant moving `ToWide` out of the anonymous namespace and into the `argos`
namespace proper, declaring it in `Measure.h`, and pointing `skin_demo.cpp` at the real
implementation instead of its own workaround. That's most of the commit. The rest of it
is a bug the move surfaced for free: the real `ToWide()` never checked whether
`MultiByteToWideChar`'s length-query call could return zero or negative on malformed
input. If it had, `len - 1` would underflow to a huge unsigned value, and the `resize()`
right after it would try to allocate on that scale, a crash reachable from the same
untrusted error text the naive version was already mishandling. Nobody had noticed,
because the working `ToWide` was never exercised by the one caller that would have hit
weird input.

Two different bugs, one root cause: a correct fix sitting one namespace out of reach from
the place that needed it. It's a small enough scope violation that the compiler never
complains, anonymous namespaces exist specifically to be invisible on purpose, but
invisible-on-purpose and invisible-to-the-code-that-needed-it turned out to be the same
thing here, and the second one is the one that costs you.
