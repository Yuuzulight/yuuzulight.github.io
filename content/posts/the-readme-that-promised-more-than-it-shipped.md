---
title: The README that promised more than it shipped
date: 2026-08-18
summary: Fixing one broken install link in db-artisan's README turned up a second, bigger problem. The docs described five skills. Only one of them actually exists.
tags: ["db-artisan", "documentation"]
draft: false
---

The install command in db-artisan's own README pointed at
`Yuuzulight/data-engineering-skills`, a URL that 404s. The repo had been renamed at
some point and the docs never caught up, so anyone who copy-pasted the Quick Start
command got a failure on the first thing they tried.

That part was a quick fix: point the URL, the Discussions and Issues links, and a
couple of leftover mentions of the old project name at the repo's actual current name.
Small, mechanical, done in a few minutes.

Fixing it properly meant actually reading the rest of the README to check for other
stale references, and that's where it got more interesting. The skills table listed
five entries. The structure tree showed `research/` and `scripts/` directories. Three
example files were referenced by name. None of that exists in the repository. What
actually ships is one skill, `data-schema-design`, and one examples file next to it.
Four of the five install commands a reader might have tried would have failed exactly
the same way the stale URL did, just for a different reason.

The changelog told its own small lie too. A `0.1.0` entry credited work that was never
written, dated with a `2026-01-XX` placeholder that had never been filled in, because
nothing had actually been tagged or released yet.

The fix wasn't just correcting the broken link, it was bringing the whole document back
down to what the repository actually contains. The skills table now lists the one skill
that exists. The structure tree matches the real layout. The four skills that don't
exist yet moved to a roadmap section, with their intended install names kept intact so
the URLs will be correct on the day they actually ship. The changelog entry moved under
`Unreleased` and only claims what's really there.

I checked the fix the same way I'd want someone checking mine: ran the actual install
command against the actual repo and confirmed it installs the real file with the right
frontmatter, then ran a markdown linter across every file and confirmed every relative
link in the docs resolves against something that's actually on disk.

A broken link is an easy thing to notice and fix. The more useful habit is not stopping
once that one thing is fixed, and asking whether the rest of the document you're
already looking at is still telling the truth.
