import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId) throw new Error('Set SANITY_STUDIO_PROJECT_ID (see studio/.env.example).');

// Site settings is one document, not a list: it opens straight to the form
// and cannot be created twice.
const SINGLETON = 'siteSettings';

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
            S.documentTypeListItem('post').title('Blog articles'),
            S.documentTypeListItem('project').title('Project photos'),
            S.divider(),
            S.listItem()
              .title('Site settings')
              .id(SINGLETON)
              .child(S.document().schemaType(SINGLETON).documentId(SINGLETON)),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: prev => prev.filter(item => item.templateId !== SINGLETON),
  },
});
