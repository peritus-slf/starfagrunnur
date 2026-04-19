"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "starfagrunnur-theme";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getClientSnapshot(): Theme {
  return (localStorage.getItem(STORAGE_KEY) as Theme) || "light";
}

// Server snapshot — before hydration, we don't know the user's theme.
// The pre-hydration inline script in layout.tsx already applied any stored
// theme to the <html> element, so the visible page is correct; this is only
// for the button label during the first client render.
function getServerSnapshot(): Theme {
  return "light";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
    // Fire a storage event manually so useSyncExternalStore picks up the change
    // (the browser only fires storage events in *other* tabs by default).
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: next }));
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "light" ? "Skipta yfir í dökkt þema" : "Skipta yfir í ljóst þema"}
      className="flex items-center gap-1.5 border border-border-subtle px-2.5 py-1.5 transition-colors hover:border-amber"
      style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: "0.625rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        color: "var(--text-secondary)",
      }}
    >
      {theme === "light" ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          Dökkt
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          Ljóst
        </>
      )}
    </button>
  );
}
