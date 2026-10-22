---
title: The benchmark that needed a kill switch
date: 2026-09-08
summary: Measuring Electron against Mana's native Windows launcher meant watching windows-launcher push a 32GB machine to 98.8% RAM in three seconds and killing it before it finished starting. The native launcher settled at 540MB in twelve.
tags: ["mana", "performance", "windows"]
draft: false
---

The first run of `windows-launcher` on the test machine climbed to 98.8% system RAM,
0.4GB free out of 32GB, in three seconds. It hadn't settled yet. It was still rising
when the hard kill-switch built into the test harness ended the process, because
letting it keep going on a machine that close to its ceiling wasn't a risk worth
taking for a benchmark. `windows-launcher`'s true steady-state memory cost is still
unknown. What's known is that it's large, and it arrives fast.

`windows-native-launcher`, the C#/WinForms replacement, settled the same test in
twelve seconds at roughly 540MB of incremental RAM and 21MB of VRAM: 183MB for the
shell, 80MB for `node-bot`, 255MB for the Kokoro TTS fallback. Both runs shared one
piece of infrastructure to keep the comparison fair where it could be: Fish Speech,
started once, confirmed healthy, and left running for both tests, so its own ~5GB
footprint is identical on both sides and cancels out rather than padding whichever
launcher happened to start it.

It isn't a clean isolated "Electron overhead" number, and the writeup says so directly
rather than presenting it as one. `windows-launcher` starts a Python retriever, a local
SearXNG instance, and a local embedder on every launch; `ManaProcessManager.cs` on the
native side only ever starts Kokoro, Fish Speech, and `node-bot`. Neither run had a
working primary LLM server either — a 14B-parameter GGUF was missing on the test
machine, so `llama-server` failed to load identically both times. The numbers are each
launcher's real total behavior with those specific gaps, not a complete
everything-running total for either one, and not the same set of services on both
sides. Measuring RAM and VRAM every couple of seconds through the whole run, rather
than one snapshot after launch, was what caught how fast the divergence actually
happens — both launchers show a burst on startup that looks nothing like where they
end up, when they get the chance to end up anywhere at all.

The benchmark existed to answer one specific question: whether the native launcher
could actually replace the Electron one without threatening to take the rest of the
machine down with it. Feature parity itself was already done and dated — the full
voice and avatar loop, the settings surface, screen-context awareness, the artifact
viewer, live captions, the whole `#565`–`#586` batch closed out a full day earlier.
The memory claim was the one piece still sitting as an open question, the last thing
standing between "feature complete" and being the recommended way to run Mana.
`windows-launcher` stays installed regardless, kept as a fallback rather than removed,
not because of any known gap in the other one.
