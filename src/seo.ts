import { COPY, fill, type Lang } from './copy';
import { SERVICES } from './content/services';
import { postBySlug, categoryLabel } from './content/posts';
import { pick } from './content/l10n';
import { media, PHOTOS } from './content/media';
import { localePath, FR_PREFIX } from './lib/routes';
import { SOCIAL } from './content/social';
import { ADDRESS, BRAND_NAME, COMPANY_EMAIL, LEGAL_NAME, PHONE_E164, SITE_URL } from './site';

const abs = (path: string) => `${SITE_URL}${path}`;
const ORG_ID = `${SITE_URL}/#organization`;

// One @id shared by every page's graph, so both language trees and every
// sub-page describe the SAME business to Google.
function organization(lang: Lang) {
  return {
    '@type': 'GeneralContractor',
    '@id': ORG_ID,
    name: BRAND_NAME,
    legalName: LEGAL_NAME,
    description: COPY[lang].seo.organizationDescription,
    url: abs(localePath(lang, '/')),
    logo: abs('/media/logo-horizontal-light.png'),
    image: abs(media(PHOTOS.facade)),
    telephone: PHONE_E164,
    email: COMPANY_EMAIL,
    founder: { '@type': 'Person', name: 'Denis Collin' },
    ...(SOCIAL.length ? { sameAs: SOCIAL.map(s => s.url) } : {}),
    address: { '@type': 'PostalAddress', ...ADDRESS },
    areaServed: ['New Brunswick', 'Nova Scotia', 'Prince Edward Island', 'Newfoundland and Labrador', 'Ottawa'],
    knowsLanguage: ['en-CA', 'fr-CA'],
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => `https://schema.org/${d}`),
      opens: '06:00',
      closes: '17:00',
    }],
    makesOffer: SERVICES.map(s => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: pick(s.name, lang), url: abs(localePath(lang, `/services/${s.key}`)) },
    })),
  };
}

export interface PageSeo {
  lang: Lang;
  locale: string;
  title: string;
  description: string;
  canonical: string;
  /** hreflang pairs including x-default: every page links to its twin. */
  alternates: { hreflang: string; href: string }[];
  ogImage: string;
  ogType: 'website' | 'article';
  noindex: boolean;
  jsonLd: unknown[];
}

/** `path` is the language-less route (`/`, `/services/caulking`, `/blog/x`). */
export function seoFor(lang: Lang, path: string): PageSeo {
  const t = COPY[lang];
  const canonical = abs(localePath(lang, path));
  let title = t.seo.notFound.title;
  let description = t.seo.notFound.description;
  let ogImage = abs(media(PHOTOS.facade));
  let ogType: PageSeo['ogType'] = 'website';
  let noindex = false;
  const crumbs: { name: string; path: string }[] = [];
  const extra: unknown[] = [];

  const service = path.startsWith('/services/') ? SERVICES.find(s => `/services/${s.key}` === path) : undefined;
  const post = path.startsWith('/blog/') ? postBySlug(path.slice('/blog/'.length)) : undefined;
  const simple: Record<string, keyof typeof t.seo> = {
    '/': 'home', '/about': 'about', '/projects': 'projects', '/blog': 'blog', '/contact': 'contact', '/terms': 'terms', '/privacy': 'privacy',
  };

  if (simple[path]) {
    const entry = t.seo[simple[path]] as { title: string; description: string };
    title = entry.title;
    description = entry.description;
    if (path !== '/') crumbs.push({ name: title.split(' | ')[0], path });
  } else if (service) {
    const name = pick(service.name, lang);
    title = fill(t.seo.service.title, { name });
    description = `${pick(service.card, lang)} ${t.seo.service.descriptionSuffix}`;
    if (service.photo) ogImage = abs(media(PHOTOS[service.photo]));
    crumbs.push({ name, path });
  } else if (post) {
    title = `${pick(post.title, lang)} | ${t.seo.siteName}`;
    description = pick(post.excerpt, lang);
    // CMS photos: ask the CDN for a JPEG, which every link-preview scraper reads.
    if (post.photoUrl) ogImage = `${post.photoUrl}&fm=jpg`;
    else if (post.photo) ogImage = abs(media(PHOTOS[post.photo]));
    ogType = 'article';
    // Sample articles exist for review only; keep them out of search results.
    noindex = post.sample;
    crumbs.push({ name: t.nav.blog, path: '/blog' }, { name: pick(post.title, lang), path });
    extra.push({
      '@type': 'BlogPosting',
      headline: pick(post.title, lang),
      description,
      datePublished: post.date,
      image: ogImage,
      articleSection: pick(categoryLabel(post.category), lang),
      inLanguage: lang === 'fr' ? 'fr-CA' : 'en-CA',
      mainEntityOfPage: canonical,
      author: post.author ? { '@type': 'Person', name: post.author } : { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
    });
  } else {
    noindex = true;
  }

  const breadcrumb = crumbs.length
    ? [{
        '@type': 'BreadcrumbList',
        itemListElement: [{ name: t.nav.home, path: '/' }, ...crumbs].map((c, i) => ({
          '@type': 'ListItem', position: i + 1, name: c.name, item: abs(localePath(lang, c.path)),
        })),
      }]
    : [];

  return {
    lang,
    locale: lang === 'fr' ? 'fr_CA' : 'en_CA',
    title,
    description,
    canonical,
    // x-default is the English page: what a visitor with no matching
    // language preference should get.
    alternates: [
      { hreflang: 'en-CA', href: abs(localePath('en', path)) },
      { hreflang: 'fr-CA', href: abs(localePath('fr', path)) },
      { hreflang: 'x-default', href: abs(localePath('en', path)) },
    ],
    ogImage,
    ogType,
    noindex,
    jsonLd: [{
      '@context': 'https://schema.org',
      '@graph': [
        organization(lang),
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: abs(localePath(lang, '/')),
          name: BRAND_NAME,
          publisher: { '@id': ORG_ID },
          inLanguage: lang === 'fr' ? 'fr-CA' : 'en-CA',
        },
        {
          '@type': 'WebPage',
          '@id': `${canonical}#webpage`,
          url: canonical,
          name: title,
          description,
          isPartOf: { '@id': `${SITE_URL}/#website` },
          about: { '@id': ORG_ID },
          inLanguage: lang === 'fr' ? 'fr-CA' : 'en-CA',
        },
        ...breadcrumb,
        ...extra,
      ],
    }],
  };
}

export { FR_PREFIX };
