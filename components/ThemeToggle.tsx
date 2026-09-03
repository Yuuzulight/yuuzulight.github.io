"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

/**
 * Reads and writes the same `.dark` class and `localStorage.theme` key that
 * the blocking script in layout.tsx sets before paint. That script is the
 * source of truth for the class on load; this component only needs to know
 * which icon to show, which it can't know during SSR (the server has no
 * access to localStorage or the visitor's OS preference), so it renders
 * nothing until mounted rather than guessing and risking a hydration
 * mismatch or a one-frame icon flip.
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Toggle theme"}
      className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors duration-500 ease-soft hover:text-ink"
    >
      {mounted ? (
        isDark ? (
          <Sun size={16} weight="bold" aria-hidden />
        ) : (
          <Moon size={16} weight="bold" aria-hidden />
        )
      ) : (
        <span className="block size-4" aria-hidden />
      )}
    </button>
  );
}
