import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
// react-router v7 ships StaticRouter from `react-router` itself.
import { StaticRouter } from 'react-router';
import { AppRoutes } from './App';
import { seoFor } from './seo';
import { headTags } from './lib/head';
import { splitLocalePath, allRoutes } from './lib/routes';

export { allRoutes };

/**
 * Renders one route to static HTML at build time: the same component tree
 * the browser mounts, under a StaticRouter instead of a BrowserRouter, so
 * there is no second route table that could drift from the real one. No
 * page is lazy-loaded, so a single synchronous pass renders all of it.
 */
export function renderRoute(url: string): { html: string; head: string; lang: string } {
  const { lang, path } = splitLocalePath(url);
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  );
  return { html, head: headTags(seoFor(lang, path)), lang };
}

/** The not-found page, served by Vercel for any URL with no file. */
export function renderNotFound(lang: 'en' | 'fr') {
  return renderRoute(lang === 'fr' ? '/fr/__not-found' : '/__not-found');
}
