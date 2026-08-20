---
title: The sandbox guard that forgot about drive letters
date: 2026-08-20
summary: Mana's file tools are supposed to stay inside the repo. On Windows, one path.relative() edge case let them read or write anywhere on disk instead.
tags: ["mana", "security", "debugging"]
draft: false
---

Mana's autonomous coding loop gives the model three tools, `file_read`, `file_write`,
`dir_scan`, all routed through one guard, `resolveWithinRepo()`, whose entire job is
refusing any path that resolves outside `REPO_ROOT`. The check was: compute
`path.relative(REPO_ROOT, resolvedPath)`, reject it if the result starts with `".."`.
That's the standard idiom for this, and it's correct on POSIX.

It is not correct on Windows. `path.relative()` between two paths on different drives,
`C:\` versus `D:\`, or a drive versus a UNC root, can't express the difference as a
relative path at all, so it just hands back the absolute target path unchanged. An
absolute path never starts with `".."`, so it sailed straight through the guard. A
model-supplied path like `C:\Windows\system.ini`, evaluated against a `REPO_ROOT` that
happened to live on `D:\`, resolved to itself, the check saw something that didn't start
with `".."`, and returned it as valid. From there `file_read`, `file_write`, and
`dir_scan` would all touch it, outside the sandbox they exist to enforce, on the one axis
the original check never considered.

The fix is one extra condition in the shared guard: reject not just a `rel` that starts
with `".."`, but any `rel` that's still an absolute path, since that only happens when
`resolvedPath` never actually descended from `REPO_ROOT` in the first place. Same
function, same three call sites, so nothing downstream needed to change.

What stands out about this one is how ordinary the original code looked.
`rel.startsWith("..")` is the check I'd have written too, and it's the check most
path-traversal guards use, because it generalizes across POSIX filesystems where every
path lives under a single root. Windows breaks that assumption at the filesystem level,
not at the level of any particular bug, so the guard needed a second condition that has
nothing to do with careless code and everything to do with an OS whose path model isn't
the one the idiom assumes. The lesson isn't "check your inputs more." The original code
checked its input correctly, for the case it was modeling. It's that a security boundary
is only as strong as the model of the filesystem it was written against, and that model
is worth re-deriving per platform rather than trusting because it's the standard idiom.
