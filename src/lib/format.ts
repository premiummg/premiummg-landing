import type { Lang } from '../copy';

// Dates are formatted with a fixed time zone so the prerendered HTML and the
// browser's first render agree (a visitor west of UTC would otherwise see the
// day before and trigger a hydration mismatch).
export function formatDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${iso}T12:00:00Z`));
}
