import { useCallback, useEffect, useState } from 'react';

const THEME_KEY = 'theme';

/**
 * A prerender-safe version of @premiummg/ui's `useDarkMode`, whose state
 * initializer reads `document` during render (fatal in the build-time
 * prerender, which has no `document`).
 *
 * - The boot script in index.html owns the first paint: it applies `.dark`
 *   before React loads, so there is no flash of the wrong theme.
 * - State starts `false` on the server AND on the first client render, so
 *   hydration matches; an effect then adopts what the boot script applied.
 * - The class and localStorage are written only from `toggle`, a real user
 *   action, never from an effect that could race the boot script.
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try {
        localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      } catch {
        /* blocked storage: the class still applies for this visit */
      }
      return next;
    });
  }, []);

  return { isDark, toggle };
}
