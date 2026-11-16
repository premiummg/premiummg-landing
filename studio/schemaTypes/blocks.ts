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
}

export interface L { en: string; fr: string }
export type PairedBlock =
  | { type: 'p' | 'h2' | 'quote' | 'takeaways'; text: L }
  | { type: 'list'; items: L[] };

type Shape = { kind: 'p' | 'h2' | 'quote' | 'takeaways'; text: string } | { kind: 'list'; items: string[] };

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
};

const textOf = (b: PtBlock) => (b.children ?? []).map(c => c.text ?? '').join('').trim();

// Consecutive bullet items become one list; blank blocks (a stray Enter at the
// end of the text) are dropped.
function shapes(body: PtBlock[] | undefined): Shape[] {
  const out: Shape[] = [];
  for (const b of body ?? []) {
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
      return { ok: false, error: `English has ${a.length} parts and French has ${b.length}. Both languages need the same parts, in the same order (a part is a paragraph, a heading, a quote or a whole list).` };
    }
    if (x.kind !== y.kind) {
      return { ok: false, error: `Part ${i + 1} is a ${KIND_NAME[x.kind]} in English but a ${KIND_NAME[y.kind]} in French. Both languages need the same parts, in the same order.` };
    }
    if (x.kind === 'list' && y.kind === 'list') {
      if (x.items.length !== y.items.length) {
        return { ok: false, error: `The bullet list in part ${i + 1} has ${x.items.length} items in English and ${y.items.length} in French.` };
      }
      blocks.push({ type: 'list', items: x.items.map((t, k) => ({ en: t, fr: y.items[k] })) });
    } else if (x.kind !== 'list' && y.kind !== 'list') {
      blocks.push({ type: x.kind, text: { en: x.text, fr: y.text } });
    }
  }
  return { ok: true, blocks };
}
