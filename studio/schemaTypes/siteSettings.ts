import { defineArrayMember, defineField, defineType } from 'sanity';
import { SOCIAL_PLATFORM_OPTIONS } from './options';

// A single document (see sanity.config.ts): the company's social profiles,
// shown as icons in the site's footer and passed to Google as the company's
// official profiles.
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'social',
      title: 'Social media',
      description: 'The company profiles shown as icons in the footer. Leave empty to show none.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'profile',
          fields: [
            defineField({
              name: 'platform',
              title: 'Network',
              type: 'string',
              options: { list: SOCIAL_PLATFORM_OPTIONS, layout: 'dropdown' },
              validation: rule => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Profile address',
              description: 'The full address of the company page, starting with https://',
              type: 'url',
              validation: rule => rule.required().uri({ scheme: ['https'] }),
            }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
      validation: rule =>
        rule.custom(value => {
          const nets = ((value as { platform?: string }[] | undefined) ?? []).map(p => p.platform);
          return new Set(nets).size === nets.length ? true : 'Each network can appear only once.';
        }),
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
