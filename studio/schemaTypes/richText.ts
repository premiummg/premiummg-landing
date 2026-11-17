import { defineArrayMember, defineField } from 'sanity';
import { pairBody, youtubeId, type PtBlock } from './blocks';

// The article text, written like a document: headings, paragraphs, bullet
// lists, quotes and a closing "key takeaways" box. No bold, italics or links:
// the site's design decides how text looks, so nothing an editor does can
// break a page. One body per language, same parts in the same order. A video
// or a link button is a part too: it goes in both languages (the address may
// differ, e.g. a French version of the film).
export const richText = (name: 'bodyEn' | 'bodyFr', title: string, opts: { group?: 'en' | 'fr'; allowEmpty?: boolean } = {}) =>
  defineField({
    name,
    title,
    group: opts.group,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [
          { title: 'Paragraph', value: 'normal' },
          { title: 'Heading', value: 'h2' },
          { title: 'Quote', value: 'blockquote' },
          { title: 'Key takeaways box', value: 'takeaways' },
        ],
        lists: [{ title: 'Bullet list', value: 'bullet' }],
        marks: { decorators: [], annotations: [] },
      }),
      defineArrayMember({
        name: 'youtube',
        title: 'YouTube video',
        type: 'object',
        fields: [
          defineField({
            name: 'url',
            title: 'YouTube address',
            description: 'Paste the video address, for example https://youtu.be/ck1xR8i9M20',
            type: 'url',
            validation: rule => rule.required().custom(v => (youtubeId(v as string | undefined) ? true : 'This is not a YouTube video address.')),
          }),
        ],
        preview: { select: { title: 'url' }, prepare: ({ title }) => ({ title, subtitle: 'YouTube video' }) },
      }),
      defineArrayMember({
        name: 'linkButton',
        title: 'Link button',
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Button text', type: 'string', validation: rule => rule.required() }),
          defineField({
            name: 'url',
            title: 'Address',
            type: 'url',
            validation: rule => rule.required().uri({ scheme: ['https'] }),
          }),
        ],
        preview: { select: { title: 'label', subtitle: 'url' } },
      }),
    ],
    validation: rule =>
      rule.custom((value, ctx) => {
        // The two bodies sit side by side in the same object: a post, or a
        // legal section.
        const host = ctx.parent as { bodyEn?: PtBlock[]; bodyFr?: PtBlock[] } | undefined;
        const en = name === 'bodyEn' ? (value as PtBlock[] | undefined) : host?.bodyEn;
        const fr = name === 'bodyFr' ? (value as PtBlock[] | undefined) : host?.bodyFr;
        if (opts.allowEmpty && !en?.length && !fr?.length) return true;
        const result = pairBody(en, fr);
        // Report on the French tab so the message shows once, where the fix is.
        if (result.ok) return true;
        if (name === 'bodyEn') return result.error.startsWith('The English') ? result.error : true;
        return result.error;
      }),
  });
