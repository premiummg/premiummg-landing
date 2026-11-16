// The lists the site's code already owns (src/formLimits.ts, src/content/posts.ts,
// src/content/projects.ts), repeated here because the Studio is its own package.
// tests/cms.test.ts fails if either side drifts, so a new category cannot
// exist in one place only.
const l = (en: string, fr: string) => `${en} / ${fr}`;

export const SERVICE_OPTIONS = [
  { value: 'caulking', title: l('Caulking', 'Calfeutrage') },
  { value: 'firestopping', title: l('Firestopping', 'Coupe-feu') },
  { value: 'fireproofing', title: l('Fireproofing', 'Ignifugation') },
  { value: 'drywall', title: l('Drywall', 'Cloisons sèches') },
  { value: 'contracting', title: l('Contracting', 'Entrepreneur') },
];

export const POST_CATEGORY_OPTIONS = [
  { value: 'project-updates', title: l('Project updates', 'Nouvelles de projets') },
  { value: 'site-safety', title: l('Site safety', 'Sécurité au chantier') },
  { value: 'industry-trends', title: l('Industry trends', 'Tendances de l’industrie') },
  { value: 'company', title: l('Company', 'Notre entreprise') },
  ...SERVICE_OPTIONS.filter(s => s.value !== 'contracting'),
];

export const PROJECT_CATEGORY_OPTIONS = [
  { value: 'commercial-caulking', title: l('Commercial Caulking', 'Calfeutrage commercial') },
  { value: 'industrial-caulking', title: l('Industrial Caulking', 'Calfeutrage industriel') },
  { value: 'fireproofing', title: l('Fireproofing', 'Ignifugation') },
  { value: 'firestopping', title: l('Firestopping', 'Coupe-feu') },
  { value: 'drywall', title: l('Drywall', 'Cloisons sèches') },
  { value: 'contracting', title: l('Contracting Services', 'Services d’entrepreneur') },
];

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: 'youtube', title: 'YouTube' },
  { value: 'linkedin', title: 'LinkedIn' },
  { value: 'facebook', title: 'Facebook' },
  { value: 'instagram', title: 'Instagram' },
  { value: 'x', title: 'X (Twitter)' },
];
