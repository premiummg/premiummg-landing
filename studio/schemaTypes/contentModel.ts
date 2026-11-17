// The site's structured content (service pages, team, certifications, legal
// pages) as Studio documents and back. Pure, like copyShape.ts: the seed turns
// the code's defaults into documents, the build turns documents into the shapes
// the pages already use, and the tests prove the round trip loses nothing.
//
// Unlike the page wording (a fixed set of strings that only ever overrides),
// these are lists an editor can grow: a service's FAQ, a team group. So a
// document is authoritative once it exists: what it holds replaces the code's
// default, and an optional section it does not hold is not shown.

type Obj = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
export interface L { en: string; fr: string }

const lz = (v: L, long = false) => ({ _type: long ? 'localizedText' : 'localizedString', en: v.en, fr: v.fr });
const readL = (v: any): L | undefined => (v && typeof v.en === 'string' && v.en.trim() && typeof v.fr === 'string' && v.fr.trim() ? { en: v.en, fr: v.fr } : undefined); // eslint-disable-line @typescript-eslint/no-explicit-any
/** A Sanity image URL sized for the page. */
export const imgUrl = (url: string, w = 1600) => `${url}?w=${w}&auto=format&q=80`;
const keyed = <T,>(xs: T[], f: (x: T, i: number) => Obj) => xs.map((x, i) => ({ _key: `i${i}`, ...f(x, i) }));

// ---- service pages ------------------------------------------------------------------

type Item = { title: L; body: L };
type Section = { title: L; items: Item[] };

const sectionToDoc = (s: Section) => ({
  title: lz(s.title),
  items: keyed(s.items, i => ({ title: lz(i.title), body: lz(i.body, true) })),
});
const sectionFromDoc = (d: any): Section | undefined => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const title = readL(d?.title);
  const items = ((d?.items ?? []) as Obj[]).flatMap(i => {
    const t = readL(i.title);
    const b = readL(i.body);
    return t && b ? [{ title: t, body: b }] : [];
  });
  return title && items.length ? { title, items } : undefined;
};

export function serviceToDoc(s: Obj): Obj {
  const doc: Obj = {
    _id: `siteService-${s.key}`,
    _type: 'siteService',
    key: s.key,
    name: lz(s.name),
    card: lz(s.card, true),
    h1: lz(s.h1),
    intro: lz(s.intro, true),
    benefitsFirst: !!s.benefitsFirst,
  };
  if (s.badge) doc.badge = lz(s.badge);
  if (s.stat) { doc.statValue = s.stat.value; doc.statLabel = lz(s.stat.label); }
  for (const k of ['offer', 'benefits', 'process']) if (s[k]) doc[k] = sectionToDoc(s[k]);
  if (s.faq?.length) doc.faq = keyed(s.faq as { q: L; a: L }[], f => ({ q: lz(f.q), a: lz(f.a, true) }));
  return doc;
}

/** The fields a service document sets, for the page to lay over its code default. */
export function serviceOverride(doc: Obj): Obj {
  const o: Obj = {};
  for (const k of ['name', 'h1'] as const) { const v = readL(doc[k]); if (v) o[k] = v; }
  for (const k of ['card', 'intro'] as const) { const v = readL(doc[k]); if (v) o[k] = v; }
  o.benefitsFirst = doc.benefitsFirst === true;
  // Optional parts follow the document: no badge in it, no badge on the page.
  o.badge = readL(doc.badge) ?? null;
  const sv = typeof doc.statValue === 'string' ? doc.statValue.trim() : '';
  const sl = readL(doc.statLabel);
  o.stat = sv && sl ? { value: sv, label: sl } : null;
  for (const k of ['offer', 'benefits', 'process']) o[k] = sectionFromDoc(doc[k]) ?? null;
  const faq = ((doc.faq ?? []) as Obj[]).flatMap(f => { const q = readL(f.q); const a = readL(f.a); return q && a ? [{ q, a }] : []; });
  o.faq = faq.length ? faq : null;
  // The service's own picture (url resolved by the query), with its description.
  o.photoUrl = typeof doc.imageUrl === 'string' && doc.imageUrl ? imgUrl(doc.imageUrl) : null;
  o.photoAlt = typeof doc.imageAlt === 'string' && doc.imageAlt.trim() ? doc.imageAlt.trim() : null;
  return o;
}

/** A service page's code default with its document laid over it. */
export function applyServiceOverride<T extends Obj>(base: T, o: Obj | undefined): T {
  if (!o) return base;
  const out: Obj = { ...base };
  for (const k of ['name', 'card', 'h1', 'intro']) if (o[k]) out[k] = o[k];
  out.benefitsFirst = o.benefitsFirst ? true : undefined;
  for (const k of ['badge', 'stat', 'offer', 'benefits', 'process', 'faq']) out[k] = o[k] ?? undefined;
  // A picture set in the Studio replaces the bundled one (and its description).
  if (o.photoUrl) { out.photoUrl = o.photoUrl; if (o.photoAlt) out.photoAlt = o.photoAlt; }
  else out.photoUrl = undefined;
  return out as T;
}

// ---- team, certifications, affiliations ---------------------------------------------------

export function teamToDoc(groups: { title: L; people: { name: string; role: L }[] }[]): Obj {
  return {
    _id: 'siteTeam',
    _type: 'siteTeam',
    groups: keyed(groups, g => ({ title: lz(g.title), people: keyed(g.people, p => ({ name: p.name, role: lz(p.role) })) })),
  };
}
export function teamFromDoc(doc: Obj | null | undefined) {
  const groups = ((doc?.groups ?? []) as Obj[]).flatMap(g => {
    const title = readL(g.title);
    const people = ((g.people ?? []) as Obj[]).flatMap(p => {
      const role = readL(p.role);
      return typeof p.name === 'string' && p.name.trim() && role
        ? [{ name: p.name.trim(), role, ...(typeof p.imageUrl === 'string' && p.imageUrl ? { photoUrl: imgUrl(p.imageUrl, 600) } : {}) }]
        : [];
    });
    return title && people.length ? [{ title, people }] : [];
  });
  return groups.length ? groups : null;
}

export function credentialsToDoc(items: { key: string; title: L; body: L }[], affiliations: string[]): Obj {
  return {
    _id: 'siteCredentials',
    _type: 'siteCredentials',
    items: keyed(items, c => ({ key: c.key, title: lz(c.title), body: lz(c.body, true) })),
    affiliations,
  };
}
export function credentialsFromDoc(doc: Obj | null | undefined) {
  const items = ((doc?.items ?? []) as Obj[]).flatMap(c => {
    const title = readL(c.title);
    const body = readL(c.body);
    return typeof c.key === 'string' && title && body ? [{ key: c.key, title, body }] : [];
  });
  const affiliations = ((doc?.affiliations ?? []) as unknown[]).filter((a): a is string => typeof a === 'string' && !!a.trim());
  return { items: items.length ? items : null, affiliations: affiliations.length ? affiliations : null };
}

// ---- legal pages ----------------------------------------------------------------------

export function legalToDoc(key: string, d: { updated: L; sections: L[] }): Obj {
  return {
    _id: `siteLegal-${key}`,
    _type: 'siteLegal',
    page: key,
    updated: lz(d.updated),
    sections: keyed(d.sections, title => ({ title: lz(title) })),
  };
}

type Pair = (en: any, fr: any) => { ok: true; blocks: unknown[] } | { ok: false; error: string }; // eslint-disable-line @typescript-eslint/no-explicit-any

export function legalFromDoc(doc: Obj, pair: Pair) {
  const updated = readL(doc.updated);
  const sections = ((doc.sections ?? []) as Obj[]).flatMap((s, i): { title: L; body: unknown[] | null }[] => {
    const title = readL(s.title);
    if (!title) return [];
    const empty = !(s.bodyEn?.length) && !(s.bodyFr?.length);
    if (empty) return [{ title, body: null }];
    const paired = pair(s.bodyEn, s.bodyFr);
    if (!paired.ok) throw new Error(`[cms] ${doc.page} page, section ${i + 1} ("${title.en}"): ${paired.error}`);
    return [{ title, body: paired.blocks }];
  });
  return { updated, sections: sections.length ? sections : null };
}
