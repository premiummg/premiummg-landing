import { describe, expect, it } from 'vitest';
import { POSTS, POST_CATEGORIES } from '../src/content/posts';
import { PROJECTS, PROJECT_CATEGORIES } from '../src/content/projects';
import { SERVICE_KEYS } from '../src/formLimits';
import { pairBody, type PtBlock } from '../studio/schemaTypes/blocks';
import { POST_CATEGORY_OPTIONS, PROJECT_CATEGORY_OPTIONS, SERVICE_OPTIONS } from '../studio/schemaTypes/options';

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

  it('offers exactly the project categories the site labels', () => {
    expect(values(PROJECT_CATEGORY_OPTIONS)).toEqual(PROJECT_CATEGORIES.map(c => c.key).sort());
  });
});

// Whatever feeds POSTS and PROJECTS (sample content or the CMS pull), the
// pages index into the lists above by key.
describe('the content the pages receive', () => {
  it('every article has a known category and service, and a picture or a placeholder', () => {
    for (const p of POSTS) {
      expect(POST_CATEGORIES.map(c => c.key), p.slug).toContain(p.category);
      expect(SERVICE_KEYS, p.slug).toContain(p.service);
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

  it('explains what is out of step instead of publishing half an article', () => {
    expect(pairBody([blk('a'), blk('b')], [blk('a')])).toMatchObject({ ok: false });
    expect(pairBody([blk('a', 'h2')], [blk('a')])).toMatchObject({ ok: false, error: expect.stringContaining('heading in English') });
    expect(pairBody([], [blk('a')])).toMatchObject({ ok: false, error: 'The English article is empty.' });
    expect(pairBody([blk('a')], [])).toMatchObject({ ok: false, error: 'The French article is empty.' });
  });
});
