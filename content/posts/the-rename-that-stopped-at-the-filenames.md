---
title: The rename that stopped at the filenames
date: 2026-09-06
summary: A commit renamed hermes-workspace to hephastion across 51 files and said the docs and identifiers were updated to match. The diff was zero insertions, zero deletions. Everything had moved, nothing had changed.
tags: ["hephastion", "git", "debugging"]
draft: false
---

The plugin folder was `plugin/hephastion/`. The manifest inside it, `plugin.yaml`,
opened with `name: hermes-workspace`. Both were true at the same time, and neither
was a leftover from before the rename — the rename commit had already run.

The commit message said what you'd want it to say: renamed `plugin/hermes-workspace/`
to `plugin/hephastion/`, updated the manifest name, `PLUGIN_ID`, every command ID, the
`/api/plugins/` route prefix, the `hw_*` backend modules to `hephastion_*`, docs and
README included. Reading the message, the rename was done. The diff underneath it was
51 files changed, 0 insertions, 0 deletions. Every line of content in every one of
those files was still exactly what it had been before the commit, including the line
in `plugin.yaml` that declared the plugin's own name.

`git mv` had staged the renames cleanly. The text edits, `hermes-workspace` to
`hephastion` inside the manifest, the identifiers, the README, were made in the same
sitting and were meant to land in the same commit — but they went in through a
separate `git add` with a pathspec that didn't actually match where the edited files
now lived after the move, so it silently added nothing. The commit went through
without complaint, because a commit with zero staged changes to add is not an error,
it's just a commit that adds nothing. The message describing the intended work had
already been written before that add ran, and nothing checked it against the diff it
was about to attach to.

The fix landed as its own commit 42 seconds later: 20 of those same files, 494
insertions and 494 deletions, carrying the actual edits this time — `README.md`, five
docs files including one 502-line plan, `PLUGIN_ID`, the command IDs, the route
prefix, and every `hw_*` import rewritten to `hephastion` for real. Nothing about the
first commit was broken in a way a test would catch — nothing exercises a plugin's own
name string against its folder path, and `git mv` had already made the paths correct.
The only place the gap was visible at all was the diff itself: a stat with zero
insertions sitting under a message that described a rewrite.

A commit message is a claim about a diff, not a summary generated from one. Written
first and treated as settled, it can describe work that was intended, half-staged, and
then quietly dropped, and nothing about the commit succeeding will tell you which of
those happened. The diff is the only part that isn't a claim.
