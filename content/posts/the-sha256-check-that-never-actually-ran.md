---
title: The SHA256 check that never actually ran
date: 2026-09-08
summary: Mana's Node.js fetch script was supposed to verify a downloaded binary's SHA256 before anything trusted it. A parenthesization bug made the check throw on every run, get silently caught, and log a warning that read exactly like an honest failure.
tags: ["mana", "security", "debugging"]
draft: false
---

`scripts/fetch_node_bin.ps1` downloads a Node.js binary for Mana's native launcher build.
Before anything downstream is allowed to use it, the script is supposed to hash the
download and compare it against the official `SHASUMS256.txt`. That comparison lived
inside its own `try`/`catch`: compute `Get-FileHash`, find the matching line in the
checksums file, compare the expected hash to the computed one, log the result.

The lookup was `Select-String -Path $shasumsFile -Pattern [regex]::Escape($fileName)
-SimpleMatch -Quiet`. Written unparenthesized like that, `[regex]::Escape($fileName)`
after `-Pattern` doesn't parse as a single argument to the cmdlet's `-Pattern`
parameter — PowerShell split it into two positional tokens instead, and `Select-String`
threw `PositionalParameterNotFound`. Not on some inputs. Every time. The verification
step failed before it ever computed a single comparison.

What made this one easy to miss is exactly what was supposed to make it safe: the
surrounding `catch { Write-Log "Warning: SHA256 verification failed: $($_.Exception.Message)"
}`. That log line reads identically whether the hash genuinely didn't match or the
check crashed before it got that far — both produce "SHA256 verification failed:
<some message>." There was no way to tell, from the log alone, "this binary failed
verification" apart from "verification never ran." And in either case the script kept
going; nothing treated the warning as fatal. So for however long this shipped, every
fetch of a Node binary skipped the check entirely, while the log implied it had at
least been attempted.

The detail that made the bug obvious once I was looking at it: two lines below the
broken call, the exact same expression, `[regex]::Escape($fileName)`, shows up again,
inside `Where-Object { $_ -match [regex]::Escape($fileName) }` — and works fine there.
`-match` is an operator, not a cmdlet parameter, so PowerShell parses the whole
right-hand side as one expression instead of splitting it at whitespace. Same code,
two calling conventions, only one of them silently fatal.

The fix is smaller than the bug: `-SimpleMatch` already does literal string matching,
so the regex escape was pointless even when it worked. I dropped it rather than
parenthesizing it, because the escaping was never correct to begin with — had it not
thrown, it would have searched for a pattern containing literal backslashes, which
can't appear in the actual `SHASUMS256.txt` content. One line changed:
`-Pattern $fileName -SimpleMatch`.

I didn't take "it doesn't throw anymore" as proof it was fixed. I built synthetic
`SHASUMS256.txt` content and ran the path against three cases: a matching hash
verifies, the right platform's entry gets picked out of a realistic multi-line file
instead of the first line that happens to match, and a genuine mismatch still gets
flagged instead of silently passing.

The lesson isn't "wrap less code in try/catch." The catch block didn't create this
bug — it hid it. A security check that fails closed by logging a generic "verification
failed" on any exception is, from the outside, indistinguishable from a check that
never ran at all, right up until someone reads the exception message behind the log
line instead of the log line itself. If a verification step can fail for two entirely
different reasons — the data was bad, or the check itself is broken — and both produce
the same warning, that warning isn't actually telling you which one happened. It's
worth asking of any catch block wrapping a check like this: if this exception fires on
literally every run, would I notice from the log, or would it just look routine?
