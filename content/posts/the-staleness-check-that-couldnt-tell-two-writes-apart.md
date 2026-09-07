---
title: The staleness check that couldn't tell two writes apart
date: 2026-09-07
summary: Mana's snapshot-store ordered undo records by comparing millisecond timestamps as strings, so two snapshots written in the same millisecond compared equal and a genuinely newer write could slip past the staleness check unflagged.
tags: ["mana", "debugging", "concurrency"]
draft: false
---

Mana's `snapshot-store.js` is the generic undo mechanism behind things like
`approveEditProposal` and the autonomous loop's `file_write` handler: before any of them
apply a change, they record a snapshot of what was there before, so an agent or a user can
roll it back later. `checkStale(id)` is what protects that rollback from firing against the
wrong state. It asks: has something else touched this same kind+key+scope since this
snapshot was taken? If so, `restoreSnapshot()` is supposed to refuse unless the caller
explicitly confirms it wants to overwrite a newer write.

The way it answered that question was by comparing `appliedAt`, a millisecond-resolution
ISO timestamp produced by `new Date().toISOString()`, as a string:

```js
const newer = listSnapshots(record.kind).filter(
  (other) =>
    other.id !== id &&
    other.key === record.key &&
    other.scope === record.scope &&
    String(other.appliedAt).localeCompare(String(record.appliedAt)) > 0,
);
```

`localeCompare(...) > 0` is a strict inequality. Two snapshots recorded within the same
millisecond produce identical `appliedAt` strings, and a string can't be greater than
itself, so neither snapshot would ever show up as "newer" than the other from the other's
point of view. `checkStale` would report `{ stale: false }` for both, even though one of
them really did land after the other. Back-to-back in-memory writes hitting the same
millisecond isn't a rare edge case here; it's routine, since nothing about recording a
snapshot involves I/O slow enough to guarantee the clock ticks between two calls.

The fix wasn't to change what gets compared, appliedAt still needs to stay a plain ISO
string, since that's the stored format every existing snapshot on disk already uses and
every caller already expects. The fix was to stop letting two calls produce the same value
in the first place:

```js
let lastAppliedAtMs = 0;
const now =
  options.now ||
  (() => {
    lastAppliedAtMs = Math.max(Date.now(), lastAppliedAtMs + 1);
    return new Date(lastAppliedAtMs).toISOString();
  });
```

Clamping to `Date.now()` when the clock has actually advanced, and to one millisecond past
the last value when it hasn't, makes every timestamp this store hands out strictly greater
than the one before it, by construction. No two snapshots can ever tie again, so the `>`
comparison in `checkStale` does what it was always supposed to do.

One thing I noticed writing this up: none of `snapshot-store.test.js`'s existing tests
actually exercise the real default clock. Every one of them passes its own `now` option,
usually a fixed string or a manually incremented counter, specifically so the test doesn't
depend on wall-clock timing. That's normally the right call for a deterministic test suite,
but it also means the fix I just described isn't covered by anything that runs the actual
default path. The bug and its fix both live entirely in code no test calls.

The lesson isn't "add more tests," though that's true too. It's that a comparison operator
carries an assumption about its inputs that's easy to state and easy to forget to check:
`>` assumes the values it's given can't tie. Any time a timestamp is standing in for
"happened after," the actual guarantee you need isn't "close enough resolution," it's
monotonic uniqueness, and those are not the same property.
