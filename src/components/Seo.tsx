import { useEffect } from 'react';
import type { Lang } from '../copy';
import { seoFor } from '../seo';

// Each helper updates the tag already in the document when there is one and
// only creates it otherwise: the prerendered HTML ships a full head of its
// own, and a blind append would leave the first page's tags in place.
function setMeta(kind: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${kind}="${CSS.escape(key)}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(kind, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setAlternates(alternates: { hreflang: string; href: string }[]) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
  for (const a of alternates) {
    const el = document.createElement('link');
    el.rel = 'alternate';
    el.hreflang = a.hreflang;
    el.href = a.href;
    document.head.appendChild(el);
  }
}

/**
 * Keeps the document head matching the current route after in-app
 * navigation. On a first load the head is already right: the build
 * prerenders it into each route's HTML (scripts/prerender.mjs), which is what
 * a crawler reads. JSON-LD is left alone for the same reason.
 */
export function Seo({ lang, path }: { lang: Lang; path: string }) {
  useEffect(() => {
    const seo = seoFor(lang, path);
    document.title = seo.title;
    document.documentElement.lang = lang;
    setMeta('name', 'description', seo.description);
    const robots = document.head.querySelector('meta[name="robots"]');
    if (seo.noindex) setMeta('name', 'robots', 'noindex, follow');
    else robots?.setAttribute('content', 'index, follow, max-image-preview:large');
    setLink('canonical', seo.canonical);
    setAlternates(seo.alternates);
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:url', seo.canonical);
    setMeta('property', 'og:image', seo.ogImage);
    setMeta('property', 'og:type', seo.ogType);
    setMeta('property', 'og:locale', seo.locale);
    setMeta('name', 'twitter:title', seo.title);
    setMeta('name', 'twitter:description', seo.description);
    setMeta('name', 'twitter:image', seo.ogImage);
  }, [lang, path]);

  return null;
}
