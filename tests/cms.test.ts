import { describe, expect, it } from 'vitest';
import { POSTS, POST_CATEGORIES } from '../src/content/posts';
import { PROJECTS, PROJECT_CATEGORIES } from '../src/content/projects';
import { SERVICE_KEYS } from '../src/formLimits';
import { pairBody, youtubeId, type PtBlock } from '../studio/schemaTypes/blocks';
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
