---
title: The consent route that wasn't lazy at all
date: 2026-09-02
summary: Mana's new add-on router is commented as lazy-loaded after consent approval, but the require() that could throw runs unconditionally at server startup. A missing brace proved it by taking the whole module down before anyone consented to anything.
tags: ["mana", "debugging"]
draft: false
---

Mana's plugin system grew a second tier this week: add-ons, gated behind explicit user
consent, alongside the existing plugins. The work lives on a branch,
`issue-500-refactor`, that's splitting `server.js`'s routes into their own files. One of
those files is `node-bot/routes/addons.js`, and its `POST /consent/:id` handler is where
an Inference Gateway add-on got special-cased: `if (id === 'inference-gateway') { ... }
else { <the original plugin-install logic> }`.

The commit that added that branch didn't re-indent or re-close the `else`. The original
try/catch kept its two-space indentation from before the `if` existed, and its closing
brace was never added to match the new nesting. `node --check` against that revision
says exactly what you'd expect: `Unexpected token ')'` at line 169, the `});` that used
to close `router.post(...)` and now has one more open brace than the parser is expecting
to close. The module doesn't parse. `require('./routes/addons')` throws before a single
line of the file runs.

That would matter less if the comment on the caller were accurate. `server-routes.js`
wraps the require in a function called `registerAddonRoutes`, annotated "Lazy-loaded to
avoid circular deps and keep core server lean," and `server.js` calls it "lazy-loaded
after consent approval." Neither claim held. `registerAddonRoutes(app)` runs once,
unconditionally, from the same synchronous setup block that wires up every other route,
at line 5048 of `server.js`. Nothing gates that call on consent, and no add-on install
event triggers it later. "Lazy" here meant the `require()` sits inside a function
instead of at the top of the file, not that it happens after anything. With this bug on
this branch, the parse error fires the moment the server starts, for every user,
whether or not they ever go near the Inference Gateway add-on.

Twenty-one minutes after the bug landed, a fix commit closed the brace and re-indented
the block. Its message cites two passing tests, `mobile-device-store` and
`e2e-pairing-smoke`, as verification. I checked both files: neither one imports,
requires, or mentions `addons.js` or `/consent` anywhere. They're the fast suite that
happens to run in CI, not a check on this code path. What actually caught this bug was
Node's own parser refusing to load the file, not a test written for it. There still
isn't one, on either side of the fix.

None of this shipped to `main`. It lived and died inside one branch, in the twenty-one
minutes between two commits. But it's a clean example of a comment describing the
opposite of what its own code does: a function labeled "lazy," annotated "after consent
approval," that in fact runs at the same time as everything else, before any consent
exists to approve. The word "lazy" was true of the mechanism, deferring the `require()`
call into a function, and false of the timing, which is what the comment was actually
trying to promise. When a comment claims something happens later, the thing worth
checking is never the comment. It's the call site.
