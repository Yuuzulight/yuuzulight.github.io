---
title: The flag that lied about being done
date: 2026-08-21
summary: A flag that gates continuous listening cleared the instant a fallback reply's synthesis finished, not when its audio stopped playing, so Mana could start listening again, and transcribing, while it was still audibly talking.
tags: ["mana", "debugging"]
draft: false
---

`speakStreamingReply()` sets a flag, `replyInProgress`, at the start and clears it in a
`finally` block when the function returns. Continuous listening checks that flag before
starting a new recording, specifically inside `recordUntilSilence()`'s Finding 4 guard,
which exists to stop a recording that's already running the moment an unrelated reply
starts, so the VAD doesn't spend up to `MAX_UTTERANCE_MS` picking up Mana's own TTS audio
as a user turn. The whole safeguard depends on one thing being true: `replyInProgress`
stays set for exactly as long as the reply is audible.

It didn't, on one path. When a streamed reply's final event comes back `changed: true`,
meaning what was already streamed doesn't match the true final text, `speakStreamingReply`
drops the stale queue and falls back to `await speakReply(result.reply, result.expression)`,
the older synthesize-the-whole-thing-at-once function. `speakReply` awaited synthesis and
`decodeAudioData`, built an `AudioBufferSourceNode`, called `src.start()`, and returned.
It never awaited `onended`. So the `await` in front of it was awaiting a promise that had
already resolved before the first word played. `speakStreamingReply`'s `finally` block ran
right behind it and cleared `replyInProgress` while the fallback's audio was still coming
out of the speakers, which meant continuous listening's own guard against exactly this
situation was already turned off for the rest of that reply.

The fix wraps `speakReply`'s body in `await new Promise((resolve) => { ...; src.onended =
() => { ...; resolve(); }; src.start(); ...})`, so the function's promise now resolves when
`onended` fires, not when `start()` returns. As a side effect it also closes a smaller
barge-in reentrancy gap: the fallback's own `watchForBargeIn()` monitor keeps polling for
the same span it used to leave unmonitored the instant a new recording loop got the chance
to start.

I couldn't run this against live Electron/Web Audio in this environment, so I verified it
with a standalone Node simulation that reproduced the old ordering (`replyInProgress`
cleared before `onended`) and then confirmed the new ordering (cleared only after). The
desktop-client suite ran 52 of 53 tests clean; the one failure is a pre-existing missing
`electron-updater` dependency in this sandbox, unrelated to this change.

There's a post already on this site about `desktop-client`'s playback design being safe
from a hung-promise bug specifically because it's fire-and-forget past `.start()`, nothing
awaiting an event that interruption never fires. That's still true, and it's still a good
property. But fire-and-forget cuts both ways: a promise that resolves before its underlying
operation finishes can't hang, and it also can't be trusted by anything downstream that
needs to know the operation is actually over. `replyInProgress` needed exactly that
guarantee from `speakReply`, and the function's shape, correct as a leaf call, silently
broke it the moment something else started depending on its timing.
