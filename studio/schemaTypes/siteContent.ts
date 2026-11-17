import { defineArrayMember, defineField, defineType } from 'sanity';
import { richText } from './richText';

// Service pages, the team, the certifications and the legal pages. Each is
// loaded once with today's content (scripts/seed-copy.mjs) so it opens filled
// in. Unlike the page wording, the lists here can grow or shrink: a service
// can have more FAQ items, a team group more people.

// Both languages are required inside every localized field, so an optional
// field is either empty or complete.
const L = (name: string, title: string, long = false, description?: string) =>
  defineField({ name, title, type: long ? 'localizedText' : 'localizedString', description });

const itemType = (name: string) =>
  defineArrayMember({
    name,
    type: 'object',
    fields: [L('title', 'Heading'), L('body', 'Text', true)],
    preview: { select: { title: 'title.en', subtitle: 'body.en' } },
  });

const section = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
    type: 'object',
    options: { collapsible: true, collapsed: true },
    fields: [
      L('title', 'Section title'),
      defineField({ name: 'items', title: 'Items', type: 'array', of: [itemType('item')] }),
    ],
  });

export const siteService = defineType({
  name: 'siteService',
  title: 'Service page',
  type: 'document',
  fields: [
    defineField({ name: 'key', title: 'Service', type: 'string', readOnly: true, description: 'Fixed: it decides the page address.' }),
    L('name', 'Name'),
    L('card', 'Short description (home page card)', true),
    L('h1', 'Page headline'),
    L('intro', 'Introduction', true),
    defineField({
      name: 'image',
      title: 'Page picture (optional)',
      description: 'Replaces the picture of this service on its page and on the home page card. Empty keeps the current one.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'imageAlt', title: 'Picture description', description: 'For people who cannot see the picture. Say what is in it, in English. Needed when you add a picture.', type: 'string' }),
    L('badge', 'Highlight badge (optional)', false, 'A small highlighted line, for example an accreditation. Leave empty for none.'),
    defineField({ name: 'statValue', title: 'Key figure (optional)', type: 'string', description: 'For example 75+. Needs the label below too.' }),
    L('statLabel', 'Key figure label (optional)'),
    defineField({ name: 'benefitsFirst', title: 'Show "benefits" before "process"', type: 'boolean' }),
    section('offer', 'What we offer', 'A titled list of cards. Leave it with no items to hide the section.'),
    section('benefits', 'Benefits', 'A titled list of cards. Leave it with no items to hide the section.'),
    section('process', 'Process', 'A titled list of cards. Leave it with no items to hide the section.'),
    defineField({
      name: 'faq',
      title: 'Frequently asked questions',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'qa',
          type: 'object',
          fields: [L('q', 'Question'), L('a', 'Answer', true)],
          preview: { select: { title: 'q.en', subtitle: 'a.en' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'name.en', subtitle: 'key' } },
});

export const siteTeam = defineType({
  name: 'siteTeam',
  title: 'Team (About page)',
  type: 'document',
  fields: [
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'group',
          type: 'object',
          fields: [
            L('title', 'Group title'),
            defineField({
              name: 'people',
              title: 'People',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'person',
                  type: 'object',
                  fields: [
                    defineField({ name: 'name', title: 'Name', type: 'string', validation: rule => rule.required() }),
                    L('role', 'Role'),
                    defineField({ name: 'image', title: 'Portrait (optional)', description: 'Without one, the person shows their initials.', type: 'image', options: { hotspot: true } }),
                  ],
                  preview: { select: { title: 'name', subtitle: 'role.en' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'title.en' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Team (About page)' }) },
});

export const siteCredentials = defineType({
  name: 'siteCredentials',
  title: 'Certifications and suppliers (About page)',
  type: 'document',
  fields: [
    defineField({
      name: 'items',
      title: 'Certifications',
      description: 'The four accreditations. The logo of each is set in Media.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'credential',
          type: 'object',
          fields: [
            defineField({
              name: 'key',
              title: 'Which one',
              type: 'string',
              options: { list: [{ value: 'ul', title: 'UL Solutions' }, { value: 'fcia', title: 'FCIA' }, { value: 'cor', title: 'COR' }, { value: 'nfca', title: 'NFCA' }], layout: 'dropdown' },
              validation: rule => rule.required(),
            }),
            L('title', 'Title'),
            L('body', 'Text', true),
          ],
          preview: { select: { title: 'title.en', subtitle: 'key' } },
        }),
      ],
      validation: rule =>
        rule.custom(value => {
          const keys = ((value as { key?: string }[] | undefined) ?? []).map(c => c.key);
          return new Set(keys).size === keys.length ? true : 'Each certification can appear only once.';
        }),
    }),
    defineField({
      name: 'affiliations',
      title: 'Suppliers and associations',
      description: 'Names shown in the "affiliations" strip.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
  ],
  preview: { prepare: () => ({ title: 'Certifications and suppliers (About page)' }) },
});

export const siteLegal = defineType({
  name: 'siteLegal',
  title: 'Legal page',
  type: 'document',
  fields: [
    defineField({ name: 'page', title: 'Page', type: 'string', readOnly: true }),
    L('updated', 'Last updated line'),
    defineField({
      name: 'sections',
      title: 'Sections',
      description: 'Each section has a title and its text, once in English and once in French. A section with no text shows a "to be added" notice.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'section',
          type: 'object',
          fields: [
            L('title', 'Title'),
            richText('bodyEn', 'Text in English', { allowEmpty: true }),
            richText('bodyFr', 'Texte en français', { allowEmpty: true }),
          ],
          preview: { select: { title: 'title.en' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'page' }, prepare: ({ title }) => ({ title: title === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions' }) },
});

const img = (name: string, title: string, description: string) =>
  defineField({ name, title, description, type: 'image', options: { hotspot: true } });

// The pictures of the site that are not part of an article or a project.
// Every field is optional: empty keeps the picture that is on the site now.
export const siteMedia = defineType({
  name: 'siteMedia',
  title: 'Site pictures',
  type: 'document',
  fieldsets: [
    { name: 'photos', title: 'Photos', options: { collapsible: true, collapsed: false } },
    { name: 'certs', title: 'Certification logos', options: { collapsible: true, collapsed: true } },
    { name: 'video', title: 'Home page film', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    { ...img('spray', 'Home hero picture', 'The picture shown behind the home page headline until the film plays (and for visitors who turn motion off). Wide, landscape.'), fieldset: 'photos' },
    { ...img('facade', 'Building facade', 'Used for sharing the site on social networks and in Google. Wide, landscape.'), fieldset: 'photos' },
    { ...img('fireproofing', 'Fireproofing work', 'A technician fireproofing steel.'), fieldset: 'photos' },
    { ...img('firestop', 'Firestopping work', 'Pipes and conduits through a firestopped wall.'), fieldset: 'photos' },
    { ...img('lift', 'Caulking on a lift', 'A technician on a boom lift.'), fieldset: 'photos' },
    { ...img('denis', 'Denis Collin portrait', 'Portrait photo, taller than wide.'), fieldset: 'photos' },
    { ...img('certUl', 'UL Solutions logo', 'Square, on a white or transparent background.'), fieldset: 'certs' },
    { ...img('certFcia', 'FCIA logo', 'Square, on a white or transparent background.'), fieldset: 'certs' },
    { ...img('certCor', 'COR logo', 'Square, on a white or transparent background.'), fieldset: 'certs' },
    { ...img('certNfca', 'NFCA logo', 'Square, on a white or transparent background.'), fieldset: 'certs' },
    defineField({
      name: 'heroVideo',
      title: 'Hero film',
      description: 'An MP4 with no sound, 720p, ideally under 3 MB. Visitors download it automatically, so a heavy file slows the home page down.',
      type: 'file',
      options: { accept: 'video/mp4' },
      fieldset: 'video',
    }),
  ],
  preview: { prepare: () => ({ title: 'Site pictures' }) },
});

export const siteContentTypes = [siteService, siteTeam, siteCredentials, siteLegal, siteMedia];
