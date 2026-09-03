---
title: The SSRF check that CodeQL refused to recognize
date: 2026-09-03
summary: A correct hostname guard in Mana's plugin store kept failing CodeQL's SSRF scan through three rewrites, because the scanner was matching comparison shape, not logic. A path-traversal check in the same file needed the identical fix.
tags: ["mana", "security", "debugging"]
draft: false
---

Mana's plugin store fetches manifests and files from GitHub, and three `https.get()`
call sites needed to prove they'd only ever hit `github.com`, `raw.githubusercontent.com`,
or `api.github.com`. The guard I wrote was ordinary: parse the URL, check the protocol,
check `ALLOWED_GITHUB_HOSTS.has(parsedUrl.hostname)`. Correct code. CodeQL's
`js/request-forgery` scan flagged all three sinks anyway, and getting it to actually
credit the check as a sanitizer took three rewrites of code that never stopped doing
the same thing.

First attempt: the guard lived in a shared helper, `assertAllowedGithubUrl(url)`,
called right before each sink. CodeQL's dataflow traced `url` all the way to
`https.get()` and never connected it to the validation next to it — same-named
variable, no provable derivation. Fix: have the helper return the validated URL's
own `.href`, and pass that into the sink instead of the original `url`, so the
argument at the sink demonstrably came from the checked value.

That didn't clear it either. Second attempt: inline the whole check at each of the
three call sites instead of delegating to the helper. Per CodeQL's own alert
code-flow view, it showed the source at the route handler and the sink at
`https.get()` with no barrier recognized in between, helper or not. Same three
lines, duplicated three times, logic unchanged. Still the same 3 findings.

Third attempt: swap `ALLOWED_GITHUB_HOSTS.has(parsedUrl.hostname)` for three chained
`===` comparisons against the literal hostnames. Same check, functionally identical
to a `Set.has()` lookup, but CodeQL's sanitizer-guard heuristics apparently
pattern-match on the comparison's shape, not on what it evaluates. I don't have
confirmation this one actually cleared the scan — the commit that made the change
says as much, framing it as the last rewrite worth trying before falling back to
dismissing the alerts in CodeQL's UI instead of restructuring the code further.

The same day, a path-traversal check in the same file needed the identical lesson.
`isPathContainedIn()` resolved the candidate path on its own, then compared the
result against each allowed root after the fact — correct, but CodeQL's
`js/path-injection` sanitizer didn't credit it. `resolveContainedPath()`, defined a
few lines above in the same file, does the equivalent check by resolving the
tainted value *through* the base directory first (`path.resolve(base, path)`, then
`path.relative(base, resolved)`), and CodeQL already recognized that one elsewhere
in the file. Rewriting the new check to match that exact call shape, not just its
logic, was what worked.

Four rewrites, across two different alert categories, and the versions that worked
changed nothing about what the code actually verified. What changed was which of
several logically equivalent forms happened to match a pattern CodeQL's sanitizer
detection was built to recognize. That's worth remembering the next time a scanner
keeps flagging code that's already correct: the fix isn't always "the logic is
wrong." Sometimes it's "say the same thing in the one shape the tool was trained
to trust," and until you find that shape, you can't tell the two cases apart from
the alert alone.
