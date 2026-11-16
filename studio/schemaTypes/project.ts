import { defineField, defineType } from 'sanity';
import { PROJECT_CATEGORY_OPTIONS } from './options';

// One photo in the projects gallery.
export const project = defineType({
  name: 'project',
  title: 'Project photo',
  type: 'document',
  fields: [
    defineField({ name: 'image', title: 'Photo', type: 'image', options: { hotspot: true }, validation: rule => rule.required() }),
    defineField({
      name: 'alt',
      title: 'Photo description',
      description: 'For people who cannot see the photo (screen readers). Say what is in it, in English.',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: PROJECT_CATEGORY_OPTIONS, layout: 'dropdown' },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Project name (optional)',
      description: 'Leave empty if the client or site should not be named.',
      type: 'object',
      options: { columns: 2 },
      fields: [
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'fr', title: 'Français', type: 'string' }),
      ],
      validation: rule =>
        rule.custom(value => {
          const n = value as { en?: string; fr?: string } | undefined;
          return !n || !!n.en === !!n.fr ? true : 'Fill both languages, or neither.';
        }),
    }),
    defineField({
      name: 'order',
      title: 'Order (optional)',
      description: 'Smaller numbers come first. Photos without a number go last, newest first.',
      type: 'number',
    }),
  ],
  preview: { select: { title: 'alt', subtitle: 'category', media: 'image' } },
});
