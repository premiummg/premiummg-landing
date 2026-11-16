import type { L } from './l10n';

// The team as listed on premiummg.ca/about-us. No portraits exist yet except
// Denis's, so each person shows initials until a photo is supplied.
export interface TeamGroup {
  title: L;
  people: { name: string; role: L }[];
}

const t = (en: string, fr: string): L => ({ en, fr });

export const TEAM: TeamGroup[] = [
  { title: t('CEO', 'Chef de la direction'), people: [{ name: 'Denis Collin', role: t('Founder | CEO', 'Fondateur | Chef de la direction') }] },
  {
    title: t('Directors of Operations', 'Directeurs des opérations'),
    people: [
      { name: 'Jeremiah MacLeod', role: t('Regional Director of Operations (Caulking & Fire Solutions Atlantic)', 'Directeur régional des opérations (Calfeutrage et solutions incendie, Atlantique)') },
      { name: 'David Johnson', role: t('Director of Operations (Drywall)', 'Directeur des opérations (Cloisons sèches)') },
      { name: 'Victor Wootton', role: t('Director of Operations (Fire Solutions - Ottawa)', 'Directeur des opérations (Solutions incendie - Ottawa)') },
    ],
  },
  {
    title: t('CFO & Chief of Staff', 'Chef des finances et chef de cabinet'),
    people: [
      { name: 'Peter Maltese', role: t('Chief Financial Officer', 'Chef des finances') },
      { name: 'Ron Sta Ana', role: t('Chief of Staff', 'Chef de cabinet') },
    ],
  },
  {
    title: t('Estimating and Project Coordinator Team', 'Équipe d’estimation et de coordination de projets'),
    people: [
      { name: 'Remi Leger', role: t('Project Manager', 'Gestionnaire de projet') },
      { name: 'Carol Andrada', role: t('Lead Estimator', 'Estimatrice principale') },
    ],
  },
  {
    title: t('Site Operation Managers', 'Gestionnaires des opérations de chantier'),
    people: [
      { name: 'Serge Leger', role: t('Site Operations Manager (Fireproofing)', 'Gestionnaire des opérations de chantier (Ignifugation)') },
      { name: 'Luis Rosales', role: t('Site Operations Manager (Firestopping)', 'Gestionnaire des opérations de chantier (Coupe-feu)') },
      { name: 'William Mckinnon', role: t('Site Operations Manager (Caulking)', 'Gestionnaire des opérations de chantier (Calfeutrage)') },
      { name: 'Jamie Cormier', role: t('Site Operations Manager (Drywall)', 'Gestionnaire des opérations de chantier (Cloisons sèches)') },
    ],
  },
];

export const CREDENTIALS: { key: 'ul' | 'fcia' | 'cor' | 'nfca'; title: L; body: L }[] = [
  { key: 'ul', title: t('UL Solutions: Qualified Firestop Contractor', 'UL Solutions : entrepreneur coupe-feu qualifié'), body: t('The highest accreditation for firestop contractors.', 'La plus haute accréditation pour les entrepreneurs en coupe-feu.') },
  { key: 'fcia', title: t('Firestop Contractors International Association', 'Firestop Contractors International Association'), body: t('Active member for 5 years, current on fire safety practices worldwide.', 'Membre actif depuis 5 ans, à jour sur les pratiques de sécurité incendie dans le monde.') },
  { key: 'cor', title: t('Certified Construction Safety Association', 'Association de sécurité de la construction, certifié'), body: t('Certified under the Certificate of Recognition (COR) program, across Atlantic Canada.', 'Certifié dans le cadre du programme de Certificat de reconnaissance (COR), partout au Canada atlantique.') },
  { key: 'nfca', title: t('Certified National Fireproofing Contractor Association', 'National Fireproofing Contractors Association, certifié'), body: t('NFCA certified for fireproofing work.', 'Certifié NFCA pour les travaux d’ignifugation.') },
];

// Suppliers and associations shown on the live About page. Their logo files
// aren't in the repo yet, so the page shows a named placeholder for each.
export const AFFILIATIONS = ['UL Solutions', 'Arrow', 'Carboline', 'NUCO', 'Tremco', 'STI', 'COR'];
