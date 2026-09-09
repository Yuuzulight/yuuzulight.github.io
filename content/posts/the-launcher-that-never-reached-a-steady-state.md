---
title: The launcher that never reached a steady state
date: 2026-09-09
summary: I finally measured the native Windows launcher's memory cost against the Electron one it's meant to replace. The native side settled in 12 seconds; the Electron side pushed a 32GB machine to 98.8% RAM in 3 and had to be killed.
tags: ["mana", "performance", "debugging"]
draft: false
---

`docs/native_launcher_plan.md` had carried the same line for a while: "a roughly 500 MB
runtime while keeping local TTS. **Not yet actually measured** -- no benchmark doc exists
for this yet." I'd been treating that number as good enough to plan around. It wasn't a
measurement, it was a guess I'd never gone back to check, so I ran both launchers and
watched what they actually did to a real machine.

The setup: Fish Speech (S1-mini) is shared, external infrastructure that neither launcher
spawns itself for the default `fish` provider -- `windows-launcher`'s `main.js` only
health-checks `127.0.0.1:8080`, and `ManaProcessManager.cs` does the same. I started it once
via `tools/start_fish_speech_native.ps1`, confirmed it healthy, and left it running for both
test runs, so its ~5GB footprint is identical on both sides and cancels out. Then each
launcher ran alone, sequentially, never both at once, with RAM (`Win32_OperatingSystem`
free/total) and VRAM (`nvidia-smi`) polled every 1.5-2 seconds through the whole run rather
than a single post-launch snapshot -- both apps show a fast initial burst that looks
nothing like where they end up.

The native launcher's own incremental cost on top of that shared baseline: ~540MB RAM,
+21MB VRAM, settled within 12 seconds -- shell 183MB, `node-bot` 80MB, Kokoro fallback
255MB, walked from the process tree with `Get-CimInstance Win32_Process` once things
stopped moving. `windows-launcher` never got that chance. Its incremental cost pushed the
same 32GB system to 98.8% RAM, 0.4GB free, within 3 seconds, and I killed it before it
reached a steady state rather than find out what happens after that. I'd added a hard 98%
RAM kill-switch to the test harness beforehand, specifically because the first uncontrolled
run came close enough to a real out-of-memory condition that I didn't want to run it again
without one.

I want to call this a clean win and I can't, not honestly. `windows-launcher` starts a
Python retriever, a local SearXNG instance, and a local embedder on every launch; the native
launcher spawns none of that -- `ManaProcessManager.cs` only ever starts Kokoro, Fish
Speech, and `node-bot`. So the numbers are each launcher's real total behavior, not an
isolated measure of "Electron overhead" with everything else held constant. I wrote that
caveat into the doc next to the numbers instead of leaving it implied, along with the other
thing neither run controls for: a 14B-parameter quality-tier GGUF was missing on this
machine, so `llama-server` failed to load identically for both, and neither number includes
a working primary LLM server.

The thing I hadn't expected going in was that the more informative result came from the
side that failed. A number like "540MB, settles in 12 seconds" is a fact about one app.
"Couldn't be safely measured to completion, needed a kill-switch to stop it from taking the
whole machine down" is a fact about the other one, and it's the more useful fact for
deciding whether to keep shipping it. A benchmark that can't finish isn't a failed
benchmark. Sometimes it's the answer.
