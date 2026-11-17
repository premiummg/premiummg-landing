// How the site's wording (src/copy.ts) becomes editable in the Studio and comes
// back into the site. Pure and import-free, like blocks.ts: the Studio builds
// its forms from it, the seed and the build script convert with it, and the
// tests prove the round trip loses nothing.
//
//   copy.ts (code defaults)  --seed-->  Studio documents  --build-->  merged copy
//
// The code keeps every string as a default. The CMS only ever overrides: a
// field the editor leaves out, or a CMS that is unreachable, falls back to the
// text in the code, so the site cannot lose a word.

export type Shape =
  | { t: 'str'; long: boolean; ph: string[] }
  | { t: 'bool' }
  | { t: 'obj'; f: Record<string, Shape> }
  | { t: 'arr'; n: number; item: Shape };

const PH = /\{[A-Za-z]+\}/g;

/** The `{name}` style slots in a string, sorted and de-duplicated. */
export const placeholdersOf = (s: string): string[] => Array.from(new Set(s.match(PH) ?? [])).sort();

const LONG = 90;

// Strings that stay in the code: the language's own name and code, and the
// breadcrumb labels (the breadcrumb is no longer shown).
export const CODE_ONLY_KEYS = ['code', 'langName', 'breadcrumb'];

/** One editable document per page, each holding some top-level keys of copy.ts. */
export const COPY_PAGES: { type: string; title: string; keys: string[] }[] = [
  { type: 'siteCopyHome', title: 'Home page', keys: ['hero', 'stats', 'credentials', 'certs', 'stakes', 'services', 'projects', 'story', 'why', 'process', 'reviews', 'blogPreview', 'estimate'] },
  { type: 'siteCopyAbout', title: 'About page', keys: ['aboutPage'] },
  { type: 'siteCopyServices', title: 'Service pages (shared labels)', keys: ['servicePage'] },
  { type: 'siteCopyProjects', title: 'Projects page', keys: ['projectsPage'] },
  { type: 'siteCopyBlog', title: 'Blog and article labels', keys: ['blogPage', 'articlePage'] },
  { type: 'siteCopyContact', title: 'Contact page and forms', keys: ['contactPage', 'form'] },
  { type: 'siteCopyLegal', title: 'Legal pages (labels)', keys: ['legal'] },
  { type: 'siteCopyGlobal', title: 'Header, footer and contact details', keys: ['skipToContent', 'nav', 'area', 'hours', 'address', 'placeholder', 'footer', 'newsletter', 'notFound', 'backToTop'] },
  { type: 'siteCopySeo', title: 'Search engines (SEO)', keys: ['seo'] },
];

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);

function union(shapes: Shape[]): Shape {
  const first = shapes[0];
  if (first.t === 'str') {
    return { t: 'str', long: shapes.some(s => s.t === 'str' && s.long), ph: first.ph };
  }
  if (first.t === 'obj') {
    const f: Record<string, Shape> = {};
    for (const s of shapes) if (s.t === 'obj') for (const [k, v] of Object.entries(s.f)) f[k] = f[k] ? union([f[k], v]) : v;
    return { t: 'obj', f };
  }
  return first;
}

/** The structure of the English text, widened by the French (a long French line makes a field a text area). */
export function deriveShape(en: unknown, fr: unknown): Shape {
  if (typeof en === 'string') {
    const f = typeof fr === 'string' ? fr : '';
    return { t: 'str', long: en.length > LONG || f.length > LONG || en.includes('\n'), ph: placeholdersOf(en) };
  }
  if (typeof en === 'boolean') return { t: 'bool' };
  if (Array.isArray(en)) {
    const items = en.map((x, i) => deriveShape(x, Array.isArray(fr) ? fr[i] : undefined));
    return { t: 'arr', n: en.length, item: union(items) };
  }
  if (isObj(en)) {
    const f: Record<string, Shape> = {};
    for (const [k, v] of Object.entries(en)) f[k] = deriveShape(v, isObj(fr) ? fr[k] : undefined);
    return { t: 'obj', f };
  }
  throw new Error('copy.ts holds a value the CMS cannot edit (only text, true/false and lists).');
}

export const copyShape = (en: Obj, fr: Obj): Shape => deriveShape(en, fr);

// ---- code defaults -> Studio documents (the seed) ---------------------------------

function node(en: unknown, fr: unknown, s: Shape): unknown {
  switch (s.t) {
    case 'str': return { _type: s.long ? 'localizedText' : 'localizedString', en, fr };
    case 'bool': return en;
    case 'obj': {
      const o: Obj = {};
      for (const [k, sub] of Object.entries(s.f)) {
        const e = (en as Obj | undefined)?.[k];
        if (e !== undefined) o[k] = node(e, (fr as Obj | undefined)?.[k], sub);
      }
      return o;
    }
    case 'arr':
      return (en as unknown[]).map((x, i) => ({ _key: `i${i}`, ...(node(x, (fr as unknown[])[i], s.item) as Obj) }));
  }
}

/** One document per page, ready to import: every string paired EN/FR. */
export function buildDocs(en: Obj, fr: Obj): Obj[] {
  const shape = copyShape(en, fr);
  if (shape.t !== 'obj') throw new Error('copy.ts must be an object');
  return COPY_PAGES.map(page => {
    const doc: Obj = { _id: page.type, _type: page.type };
    for (const k of page.keys) doc[k] = node(en[k], fr[k], shape.f[k]);
    return doc;
  });
}

// ---- Studio documents -> partial copy per language (the build) ------------------------

const LOCALIZED = new Set(['localizedString', 'localizedText']);

function split(v: unknown): { en: unknown; fr: unknown } | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'boolean') return { en: v, fr: v };
  if (Array.isArray(v)) {
    const parts = v.map(split);
    return { en: parts.map(p => p?.en), fr: parts.map(p => p?.fr) };
  }
  if (isObj(v)) {
    if (typeof v._type === 'string' && LOCALIZED.has(v._type)) {
      const clean = (x: unknown) => (typeof x === 'string' && x.trim() ? x : undefined);
      return { en: clean(v.en), fr: clean(v.fr) };
    }
    const en: Obj = {};
    const fr: Obj = {};
    for (const [k, x] of Object.entries(v)) {
      if (k.startsWith('_')) continue;
      const p = split(x);
      if (!p) continue;
      if (p.en !== undefined) en[k] = p.en;
      if (p.fr !== undefined) fr[k] = p.fr;
    }
    return { en, fr };
  }
  return undefined;
}

/** The documents the Studio holds -> `{ en, fr }`, each a partial copy tree. */
export function toPartial(docs: Obj[]): { en: Obj; fr: Obj } {
  const en: Obj = {};
  const fr: Obj = {};
  for (const doc of docs) {
    for (const [k, v] of Object.entries(doc)) {
      if (k.startsWith('_')) continue;
      const p = split(v);
      if (!p) continue;
      if (p.en !== undefined) en[k] = p.en;
      if (p.fr !== undefined) fr[k] = p.fr;
    }
  }
  return { en, fr };
}

// ---- partial copy over the code defaults (the site) --------------------------------

const sameSlots = (a: string, b: string) => placeholdersOf(a).join() === placeholdersOf(b).join();

/**
 * The code's copy with the CMS's text laid over it. Anything missing, empty or
 * of the wrong kind keeps the code's value. A string that drops a `{name}`
 * slot its default has is ignored (it would print the page wrong). A list that
 * changes length throws: the pages index into these lists (icons, columns), so
 * an extra or missing item would break the render.
 */
export function mergeCopy<T>(def: T, part: unknown, path = ''): T {
  if (part === undefined || part === null) return def;
  if (typeof def === 'string') {
    if (typeof part !== 'string' || !part.trim()) return def;
    if (!sameSlots(def, part)) {
      console.warn(`[cms] "${path}" must keep ${placeholdersOf(def).join(' ') || 'no {slots}'}; using the built-in text.`);
      return def;
    }
    return part as T;
  }
  if (typeof def === 'boolean') return (typeof part === 'boolean' ? part : def) as T;
  if (Array.isArray(def)) {
    if (!Array.isArray(part)) return def;
    if (part.length !== def.length) {
      throw new Error(`[cms] "${path}" has ${part.length} items but the site needs exactly ${def.length}. Fix it in the Studio and publish again.`);
    }
    return def.map((d, i) => mergeCopy(d, part[i], `${path}.${i}`)) as T;
  }
  if (isObj(def)) {
    const out: Obj = {};
    for (const k of Object.keys(def)) out[k] = mergeCopy(def[k], isObj(part) ? part[k] : undefined, path ? `${path}.${k}` : k);
    return out as T;
  }
  return def;
}
