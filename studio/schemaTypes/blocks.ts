// Turns the two rich-text bodies an editor writes (one per language) into the
// paired blocks the site renders: { type, text: { en, fr } }.
//
// Pure and import-free on purpose: the Studio runs it to warn the editor while
// they type, scripts/fetch-cms.mjs runs it at build time, and the tests run
// it, so all three always agree on what a valid article is.

export interface PtBlock {
  _type?: string;
  style?: string;
  listItem?: string;
  children?: { text?: string }[];
  // youtube and linkButton blocks
  url?: string;
  label?: string;
}

export interface L { en: string; fr: string }
export type PairedBlock =
  | { type: 'p' | 'h2' | 'quote' | 'takeaways'; text: L }
  | { type: 'list'; items: L[] }
  | { type: 'video'; url: L }
  | { type: 'link'; label: L; url: L };

type Shape =
  | { kind: 'p' | 'h2' | 'quote' | 'takeaways'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'video'; url: string }
  | { kind: 'link'; label: string; url: string };

const KIND: Record<string, 'p' | 'h2' | 'quote' | 'takeaways'> = {
  normal: 'p',
  h2: 'h2',
  blockquote: 'quote',
  takeaways: 'takeaways',
};

export const KIND_NAME: Record<string, string> = {
  p: 'paragraph',
  h2: 'heading',
  quote: 'quote',
  takeaways: 'key takeaways box',
  list: 'bullet list',
  video: 'YouTube video',
  link: 'link button',
};

/**
 * The 11-character id of a YouTube video from any of the addresses people
 * copy (watch?v=, youtu.be/, /shorts/, /embed/, /live/), or null.
 */
export function youtubeId(url: string | undefined): string | null {
  if (!url) return null;
  let u: URL;
  try { u = new URL(url.trim()); } catch { return null; }
  const host = u.hostname.replace(/^(www|m)\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/);
    id = m ? m[1] : u.pathname === '/watch' ? u.searchParams.get('v') : null;
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

export const isHttps = (url: string | undefined) => {
  try { return new URL((url ?? '').trim()).protocol === 'https:'; } catch { return false; }
};

const textOf = (b: PtBlock) => (b.children ?? []).map(c => c.text ?? '').join('').trim();

// Consecutive bullet items become one list; blank blocks (a stray Enter at the
// end of the text) are dropped.
function shapes(body: PtBlock[] | undefined): Shape[] {
  const out: Shape[] = [];
  for (const b of body ?? []) {
    if (b._type === 'youtube') {
      if (b.url?.trim()) out.push({ kind: 'video', url: b.url.trim() });
      continue;
    }
    if (b._type === 'linkButton') {
      if (b.url?.trim() || b.label?.trim()) out.push({ kind: 'link', label: (b.label ?? '').trim(), url: (b.url ?? '').trim() });
      continue;
    }
    if (b._type && b._type !== 'block') continue;
    const text = textOf(b);
    if (!text) continue;
    if (b.listItem) {
      const last = out[out.length - 1];
      if (last?.kind === 'list') last.items.push(text);
      else out.push({ kind: 'list', items: [text] });
    } else {
      out.push({ kind: KIND[b.style ?? 'normal'] ?? 'p', text });
    }
  }
  return out;
}

export type Paired = { ok: true; blocks: PairedBlock[] } | { ok: false; error: string };

export function pairBody(en: PtBlock[] | undefined, fr: PtBlock[] | undefined): Paired {
  const a = shapes(en);
  const b = shapes(fr);
  if (!a.length) return { ok: false, error: 'The English article is empty.' };
  if (!b.length) return { ok: false, error: 'The French article is empty.' };

  const blocks: PairedBlock[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i];
    const y = b[i];
    if (!x || !y) {
      return { ok: false, error: `English has ${a.length} parts and French has ${b.length}. Both languages need the same parts, in the same order (a part is a paragraph, a heading, a quote, a video, a link or a whole list).` };
    }
    if (x.kind !== y.kind) {
      return { ok: false, error: `Part ${i + 1} is a ${KIND_NAME[x.kind]} in English but a ${KIND_NAME[y.kind]} in French. Both languages need the same parts, in the same order.` };
    }
    if (x.kind === 'list' && y.kind === 'list') {
      if (x.items.length !== y.items.length) {
        return { ok: false, error: `The bullet list in part ${i + 1} has ${x.items.length} items in English and ${y.items.length} in French.` };
      }
      blocks.push({ type: 'list', items: x.items.map((t, k) => ({ en: t, fr: y.items[k] })) });
    } else if (x.kind === 'video' && y.kind === 'video') {
      if (!youtubeId(x.url) || !youtubeId(y.url)) {
        return { ok: false, error: `The video in part ${i + 1} needs a YouTube address in both languages (for example https://youtu.be/ck1xR8i9M20).` };
      }
      blocks.push({ type: 'video', url: { en: x.url, fr: y.url } });
    } else if (x.kind === 'link' && y.kind === 'link') {
      if (!x.label || !y.label) return { ok: false, error: `The link button in part ${i + 1} needs its text in both languages.` };
      if (!isHttps(x.url) || !isHttps(y.url)) return { ok: false, error: `The link button in part ${i + 1} needs an address starting with https:// in both languages.` };
      blocks.push({ type: 'link', label: { en: x.label, fr: y.label }, url: { en: x.url, fr: y.url } });
    } else if (x.kind !== 'list' && x.kind !== 'video' && x.kind !== 'link' && y.kind !== 'list' && y.kind !== 'video' && y.kind !== 'link') {
      blocks.push({ type: x.kind, text: { en: x.text, fr: y.text } });
    }
  }
  return { ok: true, blocks };
}
