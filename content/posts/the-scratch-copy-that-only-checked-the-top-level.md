---
title: The scratch copy that only checked the top level
date: 2026-08-23
summary: Mana's coding-agent test runner used to execute against the live workspace, so I moved it to a temp scratch copy. My first version of the node_modules junction only checked the workspace root, which would have silently broken every real test run against this exact repo.
tags: ["mana", "debugging"]
draft: false
---

Mana's autonomous coding loop has a `run_tests` tool in `acp-autonomous-loop.js` that runs allowlisted test commands so the model can check its own work. Until now it ran those commands directly against the live workspace. A test with side effects, writing temp files, mutating fixtures, could corrupt the actual working tree mid-review, and there was no getting that back once it happened.

The fix, `workspace-scratch-copy.js`, makes a fresh temp copy of the workspace before every `run_tests` call (not reused across calls, since `file_write` edits between calls need to show up), excluding the same heavy/generated directories `zed-integration.js` already excludes for its own workspace walk: `.git`, `.next`, `dist`, `node_modules`, `out`, `target`, `tmp`. `node_modules` gets special treatment: instead of copying a dependency tree that can run into gigabytes on every single test call, `findNodeModulesDirs()` walks the source tree and junctions each one back to the real directory with `fs.symlinkSync(..., "junction")`.

My first version of `findNodeModulesDirs()` only checked the workspace root. It passed every test I wrote for it, and it's wrong in exactly the way that doesn't show up until you point it at a real repo instead of a fixture. Mana's actual layout has `REPO_ROOT` sitting one level above `node-bot`, so the real dependency tree lives at `node-bot/node_modules`, not at the source root's own top level. A root-only check would have skipped it entirely, every `run_tests` call against this exact repo would have failed on missing dependencies, and I'd have shipped a fix for issue #422 that broke the one repo it needed to work on first.

I only caught it because I stopped trusting the fixture and reproduced the real layout: a test that builds `node-bot/node_modules/axios` under a monorepo root and asserts the junction resolves there, not just at the root. That test is still in the suite, with a comment explaining exactly why it exists. The actual fix was walking every directory, skipping only the excluded ones and not descending into a `node_modules` once found, since a junction to the outer one already makes everything nested under it resolvable.

The other thing I checked directly instead of assuming: what `removeScratchWorkspaceCopy()` does to those junctions when it cleans up. A recursive `rmSync` on a directory containing a symlink only removes the link, never the target, but that's exactly the kind of assumption I didn't want to be wrong about after the fact, so there's a test that creates real files behind a junction, deletes the scratch copy, and checks the files are still there.

None of this shows up as a difference in behavior when everything goes right. Both versions of the fix pass their own tests, run cleanly on a synthetic fixture, and only diverge on a repo shaped like the one the tool actually needs to run on. The lesson isn't "test more." It's that a fixture only tells you your code handles the shape you built it to have, and the shape that matters most is usually the one sitting right there in the repo you're writing the fix for.
