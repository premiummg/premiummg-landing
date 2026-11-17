import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { COPY_PAGES } from './schemaTypes/copyShape';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId) throw new Error('Set SANITY_STUDIO_PROJECT_ID (see studio/.env.example).');

// These are single documents, not lists: they open straight to the form and
// cannot be created twice. Every page of the site is one of them.
const SETTINGS = 'siteSettings';
const SINGLETONS = new Set([SETTINGS, 'siteTeam', 'siteCredentials', 'siteMedia', ...COPY_PAGES.map(p => p.type)]);
// Fixed sets: five service pages and two legal pages exist in the site's code,
// so they are edited but not added to.
const FIXED = new Set(['siteService', 'siteLegal']);

export default defineConfig({
  name: 'premiummg',
  title: 'Premium Management Group',
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: S =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Pages and wording')
              .child(
                S.list()
                  .title('Pages and wording')
                  .items([
                    ...COPY_PAGES.map(p => S.listItem().title(p.title).id(p.type).child(S.document().schemaType(p.type).documentId(p.type))),
                    S.divider(),
                    S.documentTypeListItem('siteService').title('Service pages'),
                    S.listItem().title('Team (About page)').id('siteTeam').child(S.document().schemaType('siteTeam').documentId('siteTeam')),
                    S.listItem().title('Certifications and suppliers').id('siteCredentials').child(S.document().schemaType('siteCredentials').documentId('siteCredentials')),
                    S.documentTypeListItem('siteLegal').title('Legal pages'),
                    S.divider(),
                    S.listItem().title('Site pictures').id('siteMedia').child(S.document().schemaType('siteMedia').documentId('siteMedia')),
                  ]),
              ),
            S.divider(),
            S.documentTypeListItem('post').title('Blog articles'),
            S.documentTypeListItem('project').title('Project photos'),
            S.divider(),
            S.listItem().title('Site settings').id(SETTINGS).child(S.document().schemaType(SETTINGS).documentId(SETTINGS)),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: prev => prev.filter(item => !SINGLETONS.has(item.templateId ?? '') && !FIXED.has(item.templateId ?? '')),
  },
});
