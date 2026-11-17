import { defineField, defineType } from 'sanity';
import { POST_CATEGORY_OPTIONS, SERVICE_OPTIONS } from './options';

import { richText } from './richText';

export const post = defineType({
  name: 'post',
  title: 'Blog article',
  type: 'document',
  initialValue: (_params, context) => ({ author: context.currentUser?.name?.trim() || undefined }),
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
      title: 'Service this article leads to (optional)',
      description: 'Only if the article is about one service: the closing card then sends the reader to that service page. Leave empty for company news or social media posts: the card then invites a general estimate request.',
      type: 'string',
      options: { list: SERVICE_OPTIONS, layout: 'dropdown' },
    }),
    // Filled in by itself with the name of the account that creates the article
    // (see initialValue below): nobody types it, so it is not shown.
    defineField({ name: 'author', title: 'Author', type: 'string', hidden: true }),
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
    richText('bodyEn', 'Article in English', { group: 'en' }),
    richText('bodyFr', 'Article en français', { group: 'fr' }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'title.en', subtitle: 'date', media: 'image' } },
});
