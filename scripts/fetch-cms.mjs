import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// The same function the Studio uses to warn the editor (plain TypeScript with
// no imports, which Node runs as it is).
import { pairBody } from '../studio/schemaTypes/blocks.ts';
import { toPartial } from '../studio/schemaTypes/copyShape.ts';
import { credentialsFromDoc, imgUrl, legalFromDoc, serviceOverride, teamFromDoc } from '../studio/schemaTypes/contentModel.ts';

// Pulls the published content from Sanity and writes it to
// src/content/cms.generated.json in the exact shapes the site already renders
// (Post[] and Project[]), so no page knows a CMS exists.
//
// - No SANITY_PROJECT_ID: writes an empty file and the site keeps its
//   built-in sample content. A fresh clone still builds.
// - A project id but a failed request, or a document that is missing a field:
//   the build FAILS. Publishing an old or half-empty blog on a green build
//   would be worse than not deploying.
// - A type with no documents yet (no articles, no photos) also falls back to
//   the sample content for that type, so the blog is never an empty page.
//
// Only published documents are read, from the live API (not the apicdn edge
// cache: one request per build, and the cache can hold a stale answer for a
// moment after an edit). The dataset holds nothing secret, so no token ships
// with the site.

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const OUT = join(root, 'src', 'content', 'cms.generated.json');

for (const f of ['.env.local', '.env']) {
  try { process.loadEnvFile(join(root, f)); } catch { /* optional */ }
}

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';

const SOCIAL_PLATFORMS = new Set(["youtube", "linkedin", "facebook", "instagram", "x"]);
const write = (data) => writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');

if (!projectId) {
  write({ posts: null, projects: null, social: null, copy: null, services: null, team: null, credentials: null, legal: null, media: null });
  console.log('[cms] SANITY_PROJECT_ID not set: using the built-in sample content.');
  process.exit(0);
}

const QUERY = `{
  "posts": *[_type == "post" && defined(slug.current)] | order(date desc) {
    "slug": slug.current, date, category, service, readMinutes, title, excerpt, author, imageAlt, imageCaption, bodyEn, bodyFr,
    "photoUrl": image.asset->url
  },
  "projects": *[_type == "project" && defined(image.asset)] | order(coalesce(order, 999999) asc, _createdAt desc) {
    "id": _id, category, alt, name, "photoUrl": image.asset->url
  },
  "social": *[_id == "siteSettings"][0].social[]{ platform, url },
  "copy": *[_type match "siteCopy*"],
  "services": *[_type == "siteService"]{ ..., "imageUrl": image.asset->url },
  "team": *[_id == "siteTeam"][0]{ ..., groups[]{ ..., people[]{ ..., "imageUrl": image.asset->url } } },
  "credentials": *[_id == "siteCredentials"][0],
  "legal": *[_type == "siteLegal"],
  "media": *[_id == "siteMedia"][0]{
    "photos": { "facade": facade.asset->url, "fireproofing": fireproofing.asset->url, "firestop": firestop.asset->url, "lift": lift.asset->url, "spray": spray.asset->url, "denis": denis.asset->url },
    "certs": { "ul": certUl.asset->url, "fcia": certFcia.asset->url, "cor": certCor.asset->url, "nfca": certNfca.asset->url },
    "heroVideo": heroVideo.asset->url
  }
}`;

const url = `https://${projectId}.api.sanity.io/v2025-01-01/data/query/${dataset}?perspective=published&query=${encodeURIComponent(QUERY)}`;
const res = await fetch(url);
if (!res.ok) throw new Error(`[cms] Sanity answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
const { result } = await res.json();

const fail = (what, id) => { throw new Error(`[cms] ${what} (document ${id}). Fix it in the Studio and publish again.`); };
const needL = (v, what, id) => { if (!v || !v.en || !v.fr) fail(`${what} needs both English and French`, id); return { en: v.en, fr: v.fr }; };

// Heading ids are the anchors of the article's table of contents; editors
// never see them, so they are derived from the English heading.
const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

const img = (u) => `${u}?w=1600&auto=format&q=80`;

function mapBody(p, id) {
  const paired = pairBody(p.bodyEn, p.bodyFr);
  if (!paired.ok) fail(paired.error, id);
  const used = new Set();
  return paired.blocks.map((b) => {
    if (b.type !== 'h2') return b;
    let hid = slugify(b.text.en); let n = 2;
    while (used.has(hid)) hid = `${slugify(b.text.en)}-${n++}`;
    used.add(hid);
    return { type: 'h2', id: hid, text: b.text };
  });
}

const posts = result.posts.map((p) => {
  const id = p.slug;
  for (const k of ['date', 'category', 'readMinutes']) if (p[k] == null) fail(`"${k}" is empty`, id);
  if (p.photoUrl && !p.imageAlt) fail('the cover photo has no description', id);
  const body = mapBody(p, id);
  return {
    slug: p.slug,
    sample: false,
    date: p.date,
    category: p.category,
    service: p.service ?? null,
    photo: null,
    ...(p.photoUrl ? { photoUrl: img(p.photoUrl) } : {}),
    photoAlt: p.imageAlt ?? '',
    ...(p.imageCaption?.en && p.imageCaption?.fr ? { photoCaption: { en: p.imageCaption.en, fr: p.imageCaption.fr } } : {}),
    readMinutes: p.readMinutes,
    ...(p.author?.trim() ? { author: p.author.trim() } : {}),
    title: needL(p.title, 'the title', id),
    excerpt: needL(p.excerpt, 'the summary', id),
    body,
  };
});

const projects = result.projects.map((p) => {
  if (!p.alt) fail('the photo has no description', p.id);
  if (!p.category) fail('the photo has no category', p.id);
  return {
    id: p.id,
    category: p.category,
    photo: null,
    photoUrl: img(p.photoUrl),
    alt: p.alt,
    name: p.name?.en && p.name?.fr ? { en: p.name.en, fr: p.name.fr } : null,
  };
});

const social = (result.social ?? []).map((s) => {
  if (!SOCIAL_PLATFORMS.has(s.platform)) fail(`unknown social network "${s.platform}"`, 'siteSettings');
  if (!/^https:\/\//.test(s.url ?? '')) fail(`the ${s.platform} address must start with https://`, 'siteSettings');
  return { platform: s.platform, url: s.url };
});

const slugs = posts.map((p) => p.slug);
const dup = slugs.find((s, i) => slugs.indexOf(s) !== i);
if (dup) fail('two articles share this web address', dup);

const copy = result.copy?.length ? toPartial(result.copy) : null;
const services = result.services?.length ? Object.fromEntries(result.services.map((d) => [d.key, serviceOverride(d)])) : null;
const team = teamFromDoc(result.team);
const creds = credentialsFromDoc(result.credentials);
const credentials = creds.items || creds.affiliations ? creds : null;
// Pictures: keep only the ones an editor uploaded.
const present = (o, size) => Object.fromEntries(Object.entries(o ?? {}).filter(([, u]) => u).map(([k, u]) => [k, imgUrl(u, size)]));
const photos = present(result.media?.photos, 1600);
const certs = present(result.media?.certs, 520);
const heroVideo = result.media?.heroVideo || undefined;
const media = Object.keys(photos).length || Object.keys(certs).length || heroVideo ? { photos, certs, ...(heroVideo ? { heroVideo } : {}) } : null;
const legal = result.legal?.length ? Object.fromEntries(result.legal.map((d) => [d.page, legalFromDoc(d, pairBody)])) : null;

write({ posts: posts.length ? posts : null, projects: projects.length ? projects : null, social: social.length ? social : null, copy, services, team, credentials, legal, media });
console.log(`[cms] ${projectId}/${dataset}: ${posts.length} article(s), ${projects.length} project photo(s), ${social.length} social profile(s), ${result.copy?.length ?? 0} page text document(s), ${result.services?.length ?? 0} service page(s), ${result.legal?.length ?? 0} legal page(s).`);
