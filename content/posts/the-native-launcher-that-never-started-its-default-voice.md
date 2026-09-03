---
title: The native launcher that never started its default voice
date: 2026-08-26
summary: Mana's Windows launcher only ever knew how to start Kokoro, the fallback TTS voice, and defaulted TTS_PROVIDER to match. Fish Speech, the actual default, had no startup path at all.
tags: ["mana", "debugging"]
draft: false
---

Mana's `windows-native-launcher` is the piece that boots the backend and its supporting
services before the app is usable: a system tray process that health-checks each service
and starts whatever isn't already running. `ManaProcessManager.StartAsync()` did exactly
that for two services, Kokoro on port 5011 and the backend on port 5005. It had no code
path for Fish Speech at all.

That would be fine if Kokoro were the primary voice. It isn't. `docs/fish_speech_tts.md`
is explicit that Fish Speech (S1-mini) is Mana's default TTS provider and Kokoro is its
automatic fallback. The launcher had the relationship backwards in a second place too:
`TTS_PROVIDER` defaulted to `"kokoro"` there, while `node-bot/tts-runtime.js`, the thing
actually reading that variable, defaults to `"fish"`. Two independent pieces of the same
launcher agreed with each other and disagreed with what the rest of the app expected.

The fix, `StartFishSpeech()`, isn't a copy of `StartKokoro()`. It health-checks port 8080's
`/v1/health`, not 5011, and it launches `fish_speech_native_server.py` directly rather than
shelling out to `start_fish_speech_native.ps1`. That script's own `Start-Process` call
detaches the real server process from the shell that launched it, by design, so the script
can exit once health checks pass. Every other service in this file gets a `Process` handle
back that `Dispose()` can kill on shutdown; going through the script would have handed Fish
Speech's process a longer life than the app that started it. A missing Fish Speech
virtualenv is also treated as non-fatal, unlike Kokoro's existing throw, because
`node-bot`'s own fallback default already covers that case gracefully, and Fish Speech's
native setup is a large enough manual install that most users won't have done it yet.

The part I'd flag as the honest complication: the commit message for this fix says it was
found during deep-research on the parent issue and corrected only after the user caught
the mistake directly, not by the review pass that came after. The three health checks also
ran sequentially in the first cut, so a stale listener on one port could serialize a
roughly 100-second HTTP timeout in front of the other two before Fish Speech got a chance
to start; that was only fixed with `Task.WhenAll` in a follow-up round. And
`IsFishSpeechAvailable` originally couldn't tell "already running externally" apart from
"missing setup, silently falling back to Kokoro" — both collapsed into the same null check,
so the tray's status menu could report `TTS: fish` while Kokoro was the one actually
answering.

None of these were exotic. A launcher that only implements the fallback path, a default
that points at the wrong provider, health checks that serialize instead of racing, a
boolean that can't distinguish three different reasons for being false — each one is small
on its own, and each one would have looked fine in isolation to whoever wrote it, including
me. What actually caught most of them wasn't a design review, it was someone using the
built thing and noticing the voice sounded like Kokoro when it wasn't supposed to. The
lesson isn't to write more careful code the first time. It's that "the primary path has no
code at all" is a category of bug that only surfaces by running the primary path, and no
amount of scrutiny of the fallback path you did write will ever catch it.
