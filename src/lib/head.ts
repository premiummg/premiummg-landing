import type { PageSeo } from '../seo';

const attr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// `<` is escaped so a literal `</script>` inside the payload can't close the
// tag early and spill the rest of the graph into the page as markup.
const jsonLdSafe = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

/**
 * The per-route `<head>` as HTML, for the build-time prerender. The client
 * keeps the same tags in sync on in-app navigation (Seo.tsx), so both paths
 * render the same set from the same `PageSeo`.
 */
export function headTags(seo: PageSeo): string {
  const lines = [
    `<title>${attr(seo.title)}</title>`,
    `<meta name="description" content="${attr(seo.description)}">`,
    ...(seo.noindex ? ['<meta name="robots" content="noindex, follow">'] : []),
    `<link rel="canonical" href="${attr(seo.canonical)}">`,
    ...seo.alternates.map(a => `<link rel="alternate" hreflang="${attr(a.hreflang)}" href="${attr(a.href)}">`),
    `<meta property="og:type" content="${seo.ogType}">`,
    `<meta property="og:site_name" content="Premium Group">`,
    `<meta property="og:title" content="${attr(seo.title)}">`,
    `<meta property="og:description" content="${attr(seo.description)}">`,
    `<meta property="og:url" content="${attr(seo.canonical)}">`,
    `<meta property="og:image" content="${attr(seo.ogImage)}">`,
    `<meta property="og:locale" content="${attr(seo.locale)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${attr(seo.title)}">`,
    `<meta name="twitter:description" content="${attr(seo.description)}">`,
    `<meta name="twitter:image" content="${attr(seo.ogImage)}">`,
    ...seo.jsonLd.map(data => `<script type="application/ld+json">${jsonLdSafe(data)}</script>`),
  ];
  return lines.join('\n');
}
