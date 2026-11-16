import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Turns the built single-page app into one real HTML file per route.
//
// The client-rendered build ships `<div id="root"></div>` and nothing else.
// Google runs the JavaScript on a second pass, but Bing, the link-preview
// scrapers and the AI crawlers mostly don't, and premiummg.ca today is a
// WordPress site whose every page IS server-rendered HTML: an empty shell
// would be a straight downgrade in what a crawler can read.
//
// Every page's content is static (copy.ts and src/content), so
// `renderToString` over the app's own route table is the whole job.

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const dist = join(root, 'dist');
const ssrDist = join(root, '.prerender');

const { renderRoute, renderNotFound, allRoutes } = await import(pathToFileURL(join(ssrDist, 'entry-prerender.js')).href);

const template = readFileSync(join(dist, 'index.html'), 'utf8');
const SEO_BLOCK = /<!--seo-start-->[\s\S]*?<!--seo-end-->/;
const APP_SLOT = '<!--app-html-->';
const HTML_TAG = '<html lang="en">';
const SITE_URL = 'https://premiummg.ca';

// Checked up front: a `String.replace` whose pattern is missing is a silent
// no-op, so a template change would otherwise ship pages with no title and
// an empty body on a green build.
for (const [what, present] of [
  ['<!--seo-start--> ... <!--seo-end--> block', SEO_BLOCK.test(template)],
  [`${APP_SLOT} slot`, template.includes(APP_SLOT)],
  [`${HTML_TAG} tag`, template.includes(HTML_TAG)],
]) {
  if (!present) throw new Error(`index.html is missing its ${what}.`);
}

// The home hero's photo is the largest thing painted above the fold, so it is
// what Largest Contentful Paint is measured on: start it with the HTML.
const HERO_PRELOAD = '<link rel="preload" as="image" href="/media/work-facade.webp" fetchpriority="high">';

// Function replacers, not strings: `String.replace` reads `$&`, `$'` and `$$`
// inside a replacement STRING as directives, so a dollar sign in the page
// would splice the template into the output.
function page({ html, head, lang }, path) {
  return template
    .replace(HTML_TAG, () => `<html lang="${lang}">`)
    .replace(SEO_BLOCK, () => (path === '/' ? `${head}\n${HERO_PRELOAD}` : head))
    .replace(APP_SLOT, () => html);
}

const routes = allRoutes();
for (const { url, path } of routes) {
  const rendered = renderRoute(url);
  if (!rendered.html.includes('id="main"')) throw new Error(`${url} prerendered without its <main>.`);
  // `/` becomes dist/index.html, `/fr/about` dist/fr/about/index.html -
  // directory-style, so a static host serves it at the clean URL.
  const outFile = url === '/' ? join(dist, 'index.html') : join(dist, url, 'index.html');
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, page(rendered, path));
}

// Vercel serves dist/404.html for any URL with no file of its own.
writeFileSync(join(dist, '404.html'), page(renderNotFound('en'), '/404'));

// Generated here, not kept in public/, so it can never list a page that no
// longer exists or miss one just added. Sample posts are noindex, so they
// are left out.
const today = new Date().toISOString().slice(0, 10);
const indexed = routes.filter(r => r.lang === 'en' && !renderRoute(r.url).head.includes('noindex'));
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...indexed.flatMap(({ path }) => ['en', 'fr'].map(lang => {
    const loc = (l) => `${SITE_URL}${l === 'fr' ? `/fr${path === '/' ? '' : path}` : path}`;
    return [
      '  <url>',
      `    <loc>${loc(lang)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <xhtml:link rel="alternate" hreflang="en-CA" href="${loc('en')}"/>`,
      `    <xhtml:link rel="alternate" hreflang="fr-CA" href="${loc('fr')}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc('en')}"/>`,
      '  </url>',
    ].join('\n');
  })),
  '</urlset>',
].join('\n');
writeFileSync(join(dist, 'sitemap.xml'), sitemap);

rmSync(ssrDist, { recursive: true, force: true });
rmSync(join(dist, '.vite'), { recursive: true, force: true });

console.log(`prerendered ${routes.length} routes + 404.html, sitemap with ${indexed.length * 2} URLs`);
