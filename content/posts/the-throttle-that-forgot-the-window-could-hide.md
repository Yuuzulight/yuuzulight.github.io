---
title: The throttle that forgot the window could hide
date: 2026-08-24
summary: windows-launcher's main window disables Chromium's background throttling so the avatar stays smooth while unfocused. That flag never turned back on when the window was genuinely hidden, which it is by default on every startup.
tags: ["mana", "debugging", "performance"]
draft: false
---

`windows-launcher/main.js` sets `backgroundThrottling: false` on Mana's main
`BrowserWindow`, with a comment explaining exactly why: Mana is meant to keep
animating while the user is elsewhere, chatting, tabbed away, and Chromium's
default background throttling would turn that smooth idle drift into visible
snapping between poses. Reasonable tradeoff, set once at window creation,
and correct for the case it names, visible but unfocused.

It says nothing about a window that isn't visible at all. `HIDE_MAIN_WINDOW_
AFTER_STARTUP` defaults to true unless someone sets the env var to `"0"`, so
on a normal run the main window hides itself right after startup finishes.
`backgroundThrottling: false` doesn't know that happened. It was set once,
at creation, and Electron has no reason to revisit it just because the
window later called `.hide()`. So on the one path every user actually runs,
Chromium's rendering throttle stays off for a window nobody can see: every
polling interval and the sidebar avatar canvas keep running unthrottled in
the background, by default, for everyone, not as an edge case someone
opted into.

This was investigated, not assumed. It's part of issue #398, filed as three
separate items to check rather than three bugs to fix, and item 3 was
explicitly scoped as "performance check" before anyone knew whether there
was a real issue there. There was. The fix is four new listeners next to
the existing `syncOverlayVisibility` ones on the same window:

```js
mainWindow.on("hide", () => {
  mainWindow.webContents.setBackgroundThrottling(true);
});
mainWindow.on("minimize", () => {
  mainWindow.webContents.setBackgroundThrottling(true);
});
mainWindow.on("show", () => {
  mainWindow.webContents.setBackgroundThrottling(false);
});
mainWindow.on("restore", () => {
  mainWindow.webContents.setBackgroundThrottling(false);
});
```

Rather than one flag fixed at creation time, throttling now tracks the
window's real, current visibility: on while it's actually hidden or
minimized, off again the moment it's shown or restored, which is exactly
when the original smoothness guarantee is supposed to apply. Same
mechanism, same intent, just re-armed on the events that actually
correspond to the state it's meant to describe.

The same investigation checked whether `desktop-client`, Mana's other
frontend, had the matching bug. It doesn't: that window has no
`HIDE_MAIN_WINDOW_AFTER_STARTUP` equivalent and no `.hide()` call anywhere
in it, so the gap this fix closes doesn't exist there to begin with. Worth
confirming before assuming symmetry between the two frontends just because
they duplicate so much else.

What made this one easy to miss is that the original code wasn't wrong
about anything it claimed. `backgroundThrottling: false` did exactly what
its comment said, kept the avatar smooth while visible but unfocused. The
bug wasn't in that logic; it was in a state the flag was never told about,
because nothing in a `webPreferences` option, set once before the window
even exists, can react to something that happens to the window afterward.
A boolean set at construction time describes the window as it was born,
not as it is now, and the two only looked like the same thing because
early on, they happened to line up.
