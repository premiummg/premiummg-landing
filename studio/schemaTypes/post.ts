import { defineArrayMember, defineField, defineType } from 'sanity';
import { POST_CATEGORY_OPTIONS, SERVICE_OPTIONS } from './options';

import { pairBody, youtubeId, type PtBlock } from './blocks';

// The article text, written like a document: headings, paragraphs, bullet
// lists, quotes and a closing "key takeaways" box. No bold, italics or links:
// the site's design decides how text looks, so nothing an editor does can
// break a page. One body per language, same parts in the same order. A video
// or a link button is a part too: it goes in both languages (the address may
// differ, e.g. a French version of the film).
const richText = (name: 'bodyEn' | 'bodyFr', title: string, group: 'en' | 'fr') =>
  defineField({
    name,
    title,
    group,
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
        const doc = ctx.document as { bodyEn?: PtBlock[]; bodyFr?: PtBlock[] } | undefined;
        const result = pairBody(
          name === 'bodyEn' ? (value as PtBlock[] | undefined) : doc?.bodyEn,
          name === 'bodyFr' ? (value as PtBlock[] | undefined) : doc?.bodyFr,
        );
        // Report on the French tab so the message shows once, where the fix is.
        if (result.ok) return true;
        if (name === 'bodyEn') return result.error.startsWith('The English') ? result.error : true;
        return result.error;
      }),
  });

export const post = defineType({
  name: 'post',
  title: 'Blog article',
  type: 'document',
  groups: [
    { name: 'en', title: 'English' },
    { name: 'fr', title: 'Français' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'localizedString' }),
    defineField({
      name: 'slug',
      title: 'Web address',
      description: 'Part of the article URL. Click Generate. Do not change it after publishing: links to the old address would break.',
      type: 'slug',
      options: { source: 'title.en', maxLength: 90 },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Publication date',
      type: 'date',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: POST_CATEGORY_OPTIONS, layout: 'dropdown' },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'service',
      title: 'Service this article leads to',
      description: 'The service page that the closing call to action sends the reader to.',
      type: 'string',
      options: { list: SERVICE_OPTIONS, layout: 'dropdown' },
      validation: rule => rule.required(),
    }),
    defineField({ name: 'excerpt', title: 'Summary', description: 'Two sentences. Shown on the blog list and in Google.', type: 'localizedText' }),
    defineField({ name: 'image', title: 'Cover photo', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'imageAlt',
      title: 'Photo description',
      description: 'For people who cannot see the photo (screen readers). Say what is in it, in English.',
      type: 'string',
      validation: rule =>
        rule.custom((value, ctx) => ((ctx.document as { image?: unknown } | undefined)?.image && !value ? 'Describe the photo.' : true)),
    }),
    defineField({ name: 'imageCaption', title: 'Photo caption (optional)', type: 'localizedString' }),
    defineField({
      name: 'readMinutes',
      title: 'Minutes to read',
      type: 'number',
      initialValue: 5,
      validation: rule => rule.required().integer().min(1).max(60),
    }),
    richText('bodyEn', 'Article in English', 'en'),
    richText('bodyFr', 'Article en français', 'fr'),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'title.en', subtitle: 'date', media: 'image' } },
});
