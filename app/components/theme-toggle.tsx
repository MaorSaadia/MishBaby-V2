"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const themeStorageKey = "mishbaby-theme";
const themeChangeEvent = "mishbaby-theme-change";

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function handleThemeChange() {
    onStoreChange();
  }

  function handleSystemThemeChange(event: MediaQueryListEvent) {
    try {
      if (window.localStorage.getItem(themeStorageKey)) return;
    } catch {
      // The system preference still works when browser storage is unavailable.
    }
    const theme: Theme = event.matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    onStoreChange();
  }

  window.addEventListener(themeChangeEvent, handleThemeChange);
  mediaQuery.addEventListener("change", handleSystemThemeChange);

  return () => {
    window.removeEventListener(themeChangeEvent, handleThemeChange);
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
  };
}

export function ThemeToggle({ mobile = false }: { mobile?: boolean }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "light");
  const nextTheme = theme === "dark" ? "light" : "dark";

  function changeTheme() {
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    try {
      window.localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      // The current page can still change theme without persistent storage.
    }
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  return (
    <button
      type="button"
      onClick={changeTheme}
      aria-label={`Use ${nextTheme} mode`}
      title={`Use ${nextTheme} mode`}
      className={mobile
        ? "mt-2 flex w-full items-center gap-3 rounded-xl border border-[#063f5b]/10 bg-white px-3 py-3 text-left text-sm font-bold text-[#063f5b] transition-colors hover:border-[#009dcc]/40 hover:text-[#009dcc]"
        : "grid size-10 shrink-0 place-items-center rounded-full border border-[#063f5b]/15 bg-white text-[#063f5b] transition-colors hover:border-[#009dcc]/40 hover:text-[#009dcc]"}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
        </svg>
      )}
      {mobile && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
