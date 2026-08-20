---
title: The reply text that arrived after it was already spoken
date: 2026-08-20
summary: Mana's chat log used to wait for every queued sentence of audio to finish playing before showing a reply's text, so a long reply spoke for a while before its own transcript caught up. The fix had to land twice.
tags: ["mana", "debugging"]
draft: false
---

`speakStreamingReply()` used to be a single round trip: send the request, get the reply
text back, speak it, done. Callers awaited the whole function and read `result.reply`
once it resolved, which was a reasonable thing to do when "resolved" meant "the reply
text is known."

Streaming changed what "resolved" means without anyone deciding that on purpose.
Sentences now arrive one at a time over NDJSON and get queued into a one-ahead
synthesize-decode-play pipeline, so the reply keeps speaking well after the text itself
has fully arrived. But the function's callers, `onRecordingStop` and `sendTextMessage`,
still awaited the same promise they always had, which now didn't resolve until every
queued chunk had finished playing. For a long reply, that's several seconds, sometimes
longer, of Mana visibly speaking a reply with nothing showing up in the chat log yet. The
transcript wasn't wrong. It was just late by exactly the length of its own audio.

The fix is an optional `onFinal(finalEvent)` callback, fired the instant the NDJSON
`final` event is read off the stream, which is always after every sentence event and
well before the queued audio for those sentences finishes playing. Both call sites now
use it to append to the chat log as soon as the reply is known, instead of waiting on the
function's overall promise. `speakStreamingReply` still returns that promise for whatever
actually needs to know when playback is fully done, it's just no longer the only signal
callers have to work with.

I had to write this fix twice. Mana runs two separate frontends, `desktop-client` and
`windows-launcher`, and this project's own working rule is that neither shares
implementation with the other by default; they've each defined their own
`stopLipSync`/`startLipSync` for a while now, and the streaming chunk queue I'd just
added was already heading the same way, one copy per app, before this pass extracted
each into its own tested sibling module instead of leaving it inlined. So the ordering
bug existed in both copies, independently, and got fixed in both, independently, in the
same sitting.

Two frontends punishing every shortcut is not a new lesson for this project, it's on the
project's own case-study page already, from an earlier bug. What's new here is seeing it
apply to a bug that had nothing to do with UI at all. `speakStreamingReply` isn't
rendering anything; it's a promise whose meaning quietly changed shape when its
implementation went from one request to a queue, and every caller still holding the old
assumption inherited the new, longer wait without agreeing to it. Duplication doesn't
just double the chance of a typo. It doubles the chance that a function's contract can
drift out from under a caller and nobody notices until someone's staring at a reply that
spoke before it was written down.
