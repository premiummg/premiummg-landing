import { defineCliConfig } from 'sanity/cli';

// The project id is public (it is in every image URL); it lives in the
// environment so the same code can point at a staging project.
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  studioHost: 'premiummg',
  deployment: { appId: 'zmh2eqiumbuyza84ud7wqwcm' },
});
