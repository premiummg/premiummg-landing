import { describe, expect, it } from 'vitest';
import { POSTS, POST_CATEGORIES } from '../src/content/posts';
import { PROJECTS, PROJECT_CATEGORIES } from '../src/content/projects';
import { SERVICE_KEYS } from '../src/formLimits';
import { pairBody, youtubeId, type PtBlock } from '../studio/schemaTypes/blocks';
import { CODE_ONLY_KEYS, COPY_PAGES, buildDocs, copyShape, mergeCopy, toPartial, type Shape } from '../studio/schemaTypes/copyShape';
import { applyServiceOverride, credentialsFromDoc, credentialsToDoc, legalFromDoc, legalToDoc, serviceOverride, serviceToDoc, teamFromDoc, teamToDoc } from '../studio/schemaTypes/contentModel';
import { DEFAULT_SERVICES } from '../src/content/services';
import { DEFAULT_AFFILIATIONS, DEFAULT_CREDENTIALS, DEFAULT_TEAM } from '../src/content/team';
import { DEFAULT_LEGAL } from '../src/content/legal';
import copyShapeJson from '../studio/schemaTypes/copy-shape.json';
import { EN, FR } from '../src/copy';
import { SOCIAL_PLATFORMS } from '../src/content/social';
import { shareUrl } from '../src/lib/share';
import { POST_CATEGORY_OPTIONS, PROJECT_CATEGORY_OPTIONS, SERVICE_OPTIONS, SOCIAL_PLATFORM_OPTIONS } from '../studio/schemaTypes/options';

const values = (o: { value: string }[]) => o.map(x => x.value).sort();

// The Studio is its own package and repeats the site's category lists. If they
// drift, an editor could pick a category the site has no label for and the
// build would crash on it (or worse, publish a page with a blank tag).
describe('Sanity Studio stays in step with the site', () => {
  it('offers exactly the services the site knows', () => {
    expect(values(SERVICE_OPTIONS)).toEqual([...SERVICE_KEYS].sort());
  });

  it('offers exactly the article categories the site labels', () => {
    expect(values(POST_CATEGORY_OPTIONS)).toEqual(POST_CATEGORIES.map(c => c.key).sort());
  });

  it('offers exactly the social networks the site has icons for', () => {
    expect(values(SOCIAL_PLATFORM_OPTIONS)).toEqual(Object.keys(SOCIAL_PLATFORMS).sort());
  });

  it('offers exactly the project categories the site labels', () => {
    expect(values(PROJECT_CATEGORY_OPTIONS)).toEqual(PROJECT_CATEGORIES.map(c => c.key).sort());
  });
});

// Whatever feeds POSTS and PROJECTS (sample content or the CMS pull), the
// pages index into the lists above by key.
describe('the content the pages receive', () => {
  it('every article has a known category and, when it names one, a known service', () => {
    for (const p of POSTS) {
      expect(POST_CATEGORIES.map(c => c.key), p.slug).toContain(p.category);
      if (p.service) expect(SERVICE_KEYS, p.slug).toContain(p.service);
    }
  });

  it('every project photo belongs to a known category and has a description', () => {
    for (const p of PROJECTS) {
      expect(PROJECT_CATEGORIES.map(c => c.key), p.id).toContain(p.category);
      expect(p.alt.length, p.id).toBeGreaterThan(0);
      expect(p.photo ?? p.photoUrl, p.id).toBeTruthy();
    }
  });
});

const blk = (text: string, style = 'normal', listItem?: string): PtBlock => ({ _type: 'block', style, listItem, children: [{ text }] });

describe('pairing the English and French article bodies', () => {
  it('pairs parts in order, groups bullets into one list and ignores blank lines', () => {
    const r = pairBody(
      [blk('Why', 'h2'), blk('Hello.'), blk(''), blk('One', 'normal', 'bullet'), blk('Two', 'normal', 'bullet'), blk('Done.', 'takeaways')],
      [blk('Pourquoi', 'h2'), blk('Bonjour.'), blk('Un', 'normal', 'bullet'), blk('Deux', 'normal', 'bullet'), blk('Fini.', 'takeaways')],
    );
    expect(r).toEqual({
      ok: true,
      blocks: [
        { type: 'h2', text: { en: 'Why', fr: 'Pourquoi' } },
        { type: 'p', text: { en: 'Hello.', fr: 'Bonjour.' } },
        { type: 'list', items: [{ en: 'One', fr: 'Un' }, { en: 'Two', fr: 'Deux' }] },
        { type: 'takeaways', text: { en: 'Done.', fr: 'Fini.' } },
      ],
    });
  });

  it('splits one pasted block with blank lines into the paragraphs it holds', () => {
    const r = pairBody(
      [blk('One.\n\nTwo.\n\n#Three')],
      [blk('Un.'), blk('Deux.'), blk(''), blk('#Trois')],
    );
    expect(r).toMatchObject({ ok: true });
    expect(r.ok && r.blocks.map(b => b.type)).toEqual(['p', 'p', 'p']);
  });

  it('explains what is out of step instead of publishing half an article', () => {
    expect(pairBody([blk('a'), blk('b')], [blk('a')])).toMatchObject({ ok: false });
    expect(pairBody([blk('a', 'h2')], [blk('a')])).toMatchObject({ ok: false, error: expect.stringContaining('heading in English') });
    expect(pairBody([], [blk('a')])).toMatchObject({ ok: false, error: 'The English article is empty.' });
    expect(pairBody([blk('a')], [])).toMatchObject({ ok: false, error: 'The French article is empty.' });
  });
});

describe('videos and link buttons in articles', () => {
  const video = (url: string): PtBlock => ({ _type: 'youtube', url });
  const link = (label: string, url: string): PtBlock => ({ _type: 'linkButton', label, url });

  it('reads the id from every address shape people copy', () => {
    for (const u of [
      'https://youtu.be/ck1xR8i9M20',
      'https://www.youtube.com/watch?v=ck1xR8i9M20&t=5s',
      'https://m.youtube.com/watch?v=ck1xR8i9M20',
      'https://www.youtube.com/shorts/ck1xR8i9M20',
      'https://www.youtube-nocookie.com/embed/ck1xR8i9M20',
    ]) expect(youtubeId(u), u).toBe('ck1xR8i9M20');
    for (const u of ['', 'not a url', 'https://vimeo.com/123', 'https://www.youtube.com/watch?v=short', 'javascript:alert(1)']) {
      expect(youtubeId(u), u).toBeNull();
    }
  });

  it('pairs a video and a link button like any other part', () => {
    const r = pairBody(
      [blk('Hi'), video('https://youtu.be/ck1xR8i9M20'), link('Watch', 'https://example.com/en')],
      [blk('Salut'), video('https://youtu.be/ck1xR8i9M20'), link('Regarder', 'https://example.com/fr')],
    );
    expect(r).toEqual({
      ok: true,
      blocks: [
        { type: 'p', text: { en: 'Hi', fr: 'Salut' } },
        { type: 'video', url: { en: 'https://youtu.be/ck1xR8i9M20', fr: 'https://youtu.be/ck1xR8i9M20' } },
        { type: 'link', label: { en: 'Watch', fr: 'Regarder' }, url: { en: 'https://example.com/en', fr: 'https://example.com/fr' } },
      ],
    });
  });

  it('refuses what could not render safely', () => {
    expect(pairBody([video('https://vimeo.com/1')], [video('https://youtu.be/ck1xR8i9M20')])).toMatchObject({ ok: false });
    expect(pairBody([link('Go', 'http://insecure.example')], [link('Aller', 'https://ok.example')])).toMatchObject({ ok: false });
    expect(pairBody([link('Go', 'javascript:alert(1)')], [link('Aller', 'https://ok.example')])).toMatchObject({ ok: false });
    expect(pairBody([blk('a'), video('https://youtu.be/ck1xR8i9M20')], [blk('a'), blk('b')])).toMatchObject({ ok: false });
  });
});

describe('share links', () => {
  it('encode the article address and title', () => {
    const url = 'https://premiummg.ca/blog/a-b';
    expect(shareUrl('linkedin', url, 'T')).toBe('https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fpremiummg.ca%2Fblog%2Fa-b');
    expect(shareUrl('x', url, 'A & B')).toContain('text=A%20%26%20B');
    expect(shareUrl('whatsapp', url, 'T')).toBe('https://wa.me/?text=T%20https%3A%2F%2Fpremiummg.ca%2Fblog%2Fa-b');
  });
});

describe('editing the site wording in the Studio', () => {
  it('the Studio forms match the structure of copy.ts (run npm run copy:shape if this fails)', () => {
    const keys = new Set(COPY_PAGES.flatMap(p => p.keys));
    const full = copyShape(EN, FR) as Extract<Shape, { t: 'obj' }>;
    const expected = { t: 'obj', f: Object.fromEntries(Object.entries(full.f).filter(([k]) => keys.has(k))) };
    expect(copyShapeJson).toEqual(expected);
  });

  it('every part of copy.ts is either on an editable page or deliberately left in the code', () => {
    const placed = COPY_PAGES.flatMap(p => p.keys);
    expect(new Set(placed).size, 'a key is on two pages').toBe(placed.length);
    expect(Object.keys(EN).sort()).toEqual([...placed, ...CODE_ONLY_KEYS].sort());
  });

  it('code to Studio documents and back loses nothing, in either language', () => {
    const { en, fr } = toPartial(buildDocs(EN, FR));
    expect(mergeCopy(EN, en)).toEqual(EN);
    expect(mergeCopy(FR, fr)).toEqual(FR);
  });

  it('an edited string replaces the default, and an empty or missing one keeps it', () => {
    const merged = mergeCopy(EN, { hero: { title: 'Edited headline', eyebrow: '   ' } });
    expect(merged.hero.title).toBe('Edited headline');
    expect(merged.hero.eyebrow).toBe(EN.hero.eyebrow);
    expect(merged.hero.cta).toBe(EN.hero.cta);
  });

  it('a string that drops a {slot} is ignored instead of printing a broken sentence', () => {
    const merged = mergeCopy(EN, { articlePage: { cta: 'See the service' } });
    expect(merged.articlePage.cta).toBe(EN.articlePage.cta);
    expect(mergeCopy(EN, { articlePage: { cta: 'Look at {name}' } }).articlePage.cta).toBe('Look at {name}');
  });

  it('a list with a different number of items fails the build (the pages are laid out for a fixed count)', () => {
    expect(() => mergeCopy(EN, { why: { items: [{ title: 'only one' }] } })).toThrow(/exactly/);
  });

  it('the shipped site has no placeholder or empty text left behind by the merge', () => {
    const walk = (v: unknown, path: string): void => {
      if (typeof v === 'string') expect(v.trim(), path).not.toBe('');
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}.${i}`));
      else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`));
    };
    walk(mergeCopy(EN, {}), 'en');
    walk(mergeCopy(FR, {}), 'fr');
  });
});

describe('editing services, team, certifications and legal pages in the Studio', () => {
  it('every service survives code -> document -> page unchanged', () => {
    for (const s of DEFAULT_SERVICES) {
      const doc = serviceToDoc(s as never);
      expect(applyServiceOverride(s, serviceOverride(doc)), s.key).toEqual(s);
    }
  });

  it('an edited service replaces the default, and a section the editor emptied disappears', () => {
    const base = DEFAULT_SERVICES.find(s => s.benefits && s.faq)!;
    const doc = serviceToDoc(base as never);
    doc.h1 = { _type: 'localizedString', en: 'New headline', fr: 'Nouveau titre' };
    delete doc.benefits;
    doc.faq = [{ _key: 'x', q: { en: 'Q?', fr: 'Q ?' }, a: { en: 'A.', fr: 'R.' } }];
    const page = applyServiceOverride(base, serviceOverride(doc));
    expect(page.h1).toEqual({ en: 'New headline', fr: 'Nouveau titre' });
    expect(page.benefits).toBeUndefined();
    expect(page.faq).toEqual([{ q: { en: 'Q?', fr: 'Q ?' }, a: { en: 'A.', fr: 'R.' } }]);
    expect(page.process).toEqual(base.process);
  });

  it('the team and the certifications round-trip', () => {
    expect(teamFromDoc(teamToDoc(DEFAULT_TEAM))).toEqual(DEFAULT_TEAM);
    expect(credentialsFromDoc(credentialsToDoc(DEFAULT_CREDENTIALS, [...DEFAULT_AFFILIATIONS]))).toEqual({
      items: DEFAULT_CREDENTIALS,
      affiliations: [...DEFAULT_AFFILIATIONS],
    });
    expect(teamFromDoc(undefined)).toBeNull();
  });

  it('a legal page keeps its headings, and a written section becomes paired blocks', () => {
    const d = DEFAULT_LEGAL.terms;
    const doc = legalToDoc('terms', d);
    expect(legalFromDoc(doc, pairBody)).toEqual({ updated: d.updated, sections: d.sections.map(title => ({ title, body: null })) });
    doc.sections[0].bodyEn = [blk('You may use this site.')];
    doc.sections[0].bodyFr = [blk('Vous pouvez utiliser ce site.')];
    const out = legalFromDoc(doc, pairBody);
    expect(out.sections?.[0].body).toEqual([{ type: 'p', text: { en: 'You may use this site.', fr: 'Vous pouvez utiliser ce site.' } }]);
    doc.sections[0].bodyFr = [];
    expect(() => legalFromDoc(doc, pairBody)).toThrow(/section 1/);
  });
});

describe('pictures edited in the Studio', () => {
  const base = DEFAULT_SERVICES[0];

  it('a service picture replaces the bundled one together with its description, and removing it restores the bundled one', () => {
    const doc = serviceToDoc(base as never);
    doc.imageUrl = 'https://cdn.sanity.io/images/p/d/abc-1200x800.jpg';
    doc.imageAlt = 'A new picture';
    const page = applyServiceOverride(base, serviceOverride(doc));
    expect(page.photoUrl).toBe('https://cdn.sanity.io/images/p/d/abc-1200x800.jpg?w=1600&auto=format&q=80');
    expect(page.photoAlt).toBe('A new picture');
    delete doc.imageUrl;
    const back = applyServiceOverride(base, serviceOverride(doc));
    expect(back.photoUrl).toBeUndefined();
    expect(back.photoAlt).toBe(base.photoAlt);
  });

  it('a team portrait is kept, and people without one stay without', () => {
    const doc = teamToDoc(DEFAULT_TEAM);
    (doc.groups[0].people[0] as Record<string, unknown>).imageUrl = 'https://cdn.sanity.io/images/p/d/face-600x800.jpg';
    const team = teamFromDoc(doc)!;
    expect(team[0].people[0].photoUrl).toBe('https://cdn.sanity.io/images/p/d/face-600x800.jpg?w=600&auto=format&q=80');
    expect(team[1].people[0].photoUrl).toBeUndefined();
  });
});
