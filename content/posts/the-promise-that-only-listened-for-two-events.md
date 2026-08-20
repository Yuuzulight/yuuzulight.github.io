---
title: The promise that only listened for two events
date: 2026-08-20
summary: Interrupting a reply, barge-in, the hotkey, a fresh reply arriving, never fired either event a playback promise was waiting on. Every interruption hung Mana's whole listen loop until the promise learned about a third one.
tags: ["mana", "debugging", "javascript"]
draft: false
---

I was streaming Mana's replies sentence by sentence instead of waiting for the whole
thing before speaking, so the wait before the first word starts is shorter. Doing that
meant playing audio chunks one at a time through a queue, and each chunk's play step
awaits a promise from `playAudioBlob()` before it starts the next one.

That promise only ever resolved two ways: the `<audio>` element's `ended` event, or its
`error` event. Both are correct for playback that runs to completion or actually fails.
Neither one fires when playback is interrupted instead, and Mana interrupts playback
constantly on purpose: barge-in when you start talking over a reply, the interrupt
hotkey, a fresh reply superseding one still playing. All three call `stopReplyAudio()`,
which calls `.pause()`, and `.pause()` fires neither `ended` nor `error`. It fires
`pause`, an event nothing was listening for.

So the promise just hung. Forever, not for a moment. And `handleTranscript`'s
`processing` gate was awaiting that same promise, so the hang didn't stay contained to
audio playback, it stalled the entire listen loop. The first time anyone interrupted a
reply, voice mode stopped noticing new speech until the app restarted. That's the kind
of bug that a normal test pass misses completely, because the golden path, let the reply
finish, say nothing, never triggers it. It only shows up the moment someone actually uses
the feature the interrupt hotkey exists for.

The fix is a `waitForPlayback()` helper that also resolves on `pause`, guarded by a
`settled` flag so it can't resolve twice, ever. That guard matters because a natural
end-of-clip isn't clean, `paused` flips true a beat before `ended` fires, so without the
guard a normal completion would resolve the promise via `pause` and then try to resolve
it again via `ended` moments later. I confirmed the original hang and the fix with a
standalone Node harness simulating `Audio`'s event semantics before touching the real
renderer, then kept that harness as a proper test module.

Worth noting: desktop-client's version of this same pipeline doesn't share this bug at
all, because it plays audio through an `AudioBufferSourceNode` that's fire-and-forget
past `.start()`, no promise to hang. Two independently written playback paths, and the
one that happened to await its own completion is the one that had a way to get stuck.
Awaiting nothing can't hang. The lesson isn't "await less." It's that a promise's
contract is only as complete as the set of ways its underlying operation can end, and
"someone stopped this on purpose" is a distinct ending from both success and failure,
easy to leave out if you're only picturing the two outcomes a test naturally reaches for.
