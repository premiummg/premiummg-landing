import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { localePath, splitLocalePath } from './routes';

/**
 * Turns an app-relative path into one in the language the visitor is already
 * reading: `href('/contact')` is `/contact` in English, `/fr/contact` in
 * French. Every in-app link goes through this, so a French visitor is never
 * dropped back into English mid-visit.
 */
export function useLocaleHref() {
  const { pathname } = useLocation();
  const { lang } = splitLocalePath(pathname);
  return useCallback((path: string) => localePath(lang, path), [lang]);
}

/**
 * `{ href, onNavigate }` for a @premiummg/ui component that renders a real
 * link (SiteButton, MediaCard, PostCard, PhotoTile): the href is what a new
 * tab, a copy-link and a crawler see; onNavigate keeps a plain click inside
 * the single-page app instead of reloading it.
 */
export function useLinkProps() {
  const href = useLocaleHref();
  const navigate = useNavigate();
  return useCallback((path: string) => {
    const to = href(path);
    return { href: to, onNavigate: () => navigate(to) };
  }, [href, navigate]);
}
