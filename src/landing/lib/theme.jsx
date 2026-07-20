/**
 * theme.jsx — minimal stand-in for `next-themes`.
 *
 * Only the marketing site is themeable; the ERP app itself is light-only. The
 * `dark` class is toggled on <html> and the choice persisted to localStorage,
 * which is all the ported ThemeToggle needs.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "gsm_site_theme";
const ThemeContext = createContext(null);

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof localStorage === "undefined") return defaultTheme;
    return localStorage.getItem(STORAGE_KEY) || defaultTheme;
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // The ERP app is light-only — make sure leaving the marketing site can never
  // strand the dashboard in dark mode.
  useEffect(() => () => applyTheme("light"), []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode) — in-memory only */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  // Rendering outside the provider shouldn't crash — fall back to light.
  return ctx || { theme: "light", resolvedTheme: "light", setTheme: () => {} };
}

export default ThemeProvider;
