import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { EN, FR } from '../src/copy';
import { SERVICES } from '../src/content/services';
import { POSTS } from '../src/content/posts';
import { SERVICE_KEYS } from '../src/formLimits';
import { allRoutes, localePath, splitLocalePath } from '../src/lib/routes';
import { seoFor } from '../src/seo';

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? filesUnder(p) : [p];
  });
}

describe('copy and content', () => {
  it('never uses an em dash (the brand does not write with them)', () => {
    const offenders = filesUnder('src')
      .filter(f => /\.(ts|tsx|css)$/.test(f))
      .filter(f => readFileSync(f, 'utf8').includes('\u2014'));
    expect(offenders).toEqual([]);
  });

  it('every service key is one the forms and the API accept', () => {
    expect(SERVICES.map(s => s.key).sort()).toEqual([...SERVICE_KEYS].sort());
  });

  it('post slugs are unique and every heading id inside a post is unique', () => {
    expect(new Set(POSTS.map(p => p.slug)).size).toBe(POSTS.length);
    for (const post of POSTS) {
      const ids = post.body.flatMap(b => (b.type === 'h2' ? [b.id] : []));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('French covers the same keys as English', () => {
    const keys = (o: unknown, prefix = ''): string[] =>
      o && typeof o === 'object' && !Array.isArray(o)
        ? Object.entries(o).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
        : [prefix];
    expect(keys(FR)).toEqual(keys(EN));
  });
});

describe('routes', () => {
  it('maps paths to both language trees and back', () => {
    expect(localePath('en', '/')).toBe('/');
    expect(localePath('fr', '/')).toBe('/fr');
    expect(localePath('fr', '/about')).toBe('/fr/about');
    expect(splitLocalePath('/fr/blog/x')).toEqual({ lang: 'fr', path: '/blog/x' });
    expect(splitLocalePath('/contact')).toEqual({ lang: 'en', path: '/contact' });
  });

  it('every route has its own title, a canonical in its language and an hreflang twin', () => {
    const titles = new Set<string>();
    for (const r of allRoutes()) {
      const seo = seoFor(r.lang, r.path);
      expect(seo.title).not.toBe(r.lang === 'fr' ? FR.seo.notFound.title : EN.seo.notFound.title);
      expect(seo.canonical).toBe(`https://premiummg.ca${r.url}`);
      expect(seo.alternates.map(a => a.hreflang)).toEqual(['en-CA', 'fr-CA', 'x-default']);
      titles.add(seo.title);
    }
    expect(titles.size).toBe(allRoutes().length);
  });

  it('sample blog posts are kept out of search results, real ones are not', () => {
    // POSTS is the sample set until the CMS holds an article, then the CMS's.
    for (const post of POSTS) {
      expect(seoFor('en', `/blog/${post.slug}`).noindex, post.slug).toBe(post.sample);
    }
    expect(seoFor('en', '/').noindex).toBe(false);
  });
});
