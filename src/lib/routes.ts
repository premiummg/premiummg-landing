import type { Lang } from '../copy';
import { SERVICES } from '../content/services';
import { POSTS } from '../content/posts';

// Two parallel URL trees, one per language: English at the root, French under
// /fr, the same split premiummg.ca already uses (/ and /fr/). A URL is the
// only thing a search engine can index or pair with hreflang, so a language
// that existed only as client state would be a language Google can't rank.
export const FR_PREFIX = '/fr';

export const SERVICE_PATH = (key: string) => `/services/${key}`;
export const POST_PATH = (slug: string) => `/blog/${slug}`;

/** App-relative path (`/contact`) to the real URL path for that language. */
export function localePath(lang: Lang, path: string): string {
  const clean = path === '/' ? '' : path;
  return lang === 'fr' ? `${FR_PREFIX}${clean}` : clean || '/';
}

/** Real URL path back to its language and the language-less remainder. */
export function splitLocalePath(pathname: string): { lang: Lang; path: string } {
  if (pathname === FR_PREFIX || pathname.startsWith(`${FR_PREFIX}/`)) {
    return { lang: 'fr', path: pathname.slice(FR_PREFIX.length) || '/' };
  }
  return { lang: 'en', path: pathname || '/' };
}

// Derived from the content rather than hand-listed: a service or a post added
// to src/content gets its own prerendered page and sitemap entry for free.
export function allPaths(): string[] {
  return [
    '/',
    '/about',
    ...SERVICES.map(s => SERVICE_PATH(s.key)),
    '/projects',
    '/blog',
    ...POSTS.map(p => POST_PATH(p.slug)),
    '/contact',
    '/terms',
    '/privacy',
  ];
}

/** Every real URL the site serves, in both languages: the prerender list. */
export function allRoutes(): { lang: Lang; path: string; url: string }[] {
  return (['en', 'fr'] as const).flatMap(lang =>
    allPaths().map(path => ({ lang, path, url: localePath(lang, path) })),
  );
}
