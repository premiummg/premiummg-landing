import type { ServiceKey } from '../formLimits';
import type { PhotoKey } from './media';
import type { L } from './l10n';
import { CMS } from './cms';

// The live gallery (premiummg.ca/premiumprojects) is photos only: no project
// names, places or descriptions. The five photos in this repo stand in for it;
// `name` stays a visible placeholder until Premium supplies the real ones.
export interface ProjectCategory {
  key: string;
  label: L;
  service: ServiceKey;
  // How many photos the live gallery has in this category today.
  liveCount: number;
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  { key: 'commercial-caulking', label: { en: 'Commercial Caulking', fr: 'Calfeutrage commercial' }, service: 'caulking', liveCount: 15 },
  { key: 'industrial-caulking', label: { en: 'Industrial Caulking', fr: 'Calfeutrage industriel' }, service: 'caulking', liveCount: 0 },
  { key: 'fireproofing', label: { en: 'Fireproofing', fr: 'Ignifugation' }, service: 'fireproofing', liveCount: 12 },
  { key: 'firestopping', label: { en: 'Firestopping', fr: 'Coupe-feu' }, service: 'firestopping', liveCount: 3 },
  { key: 'drywall', label: { en: 'Drywall', fr: 'Cloisons sèches' }, service: 'drywall', liveCount: 0 },
  { key: 'contracting', label: { en: 'Contracting Services', fr: 'Services d’entrepreneur' }, service: 'contracting', liveCount: 0 },
];

export interface Project {
  id: string;
  category: string;
  photo: PhotoKey | null;
  // Set by the CMS: a full image URL that replaces `photo`.
  photoUrl?: string;
  alt: string;
  name: L | null;
}

const SAMPLE_PROJECTS: Project[] = [
  { id: 'facade', category: 'commercial-caulking', photo: 'facade', alt: 'Multi-storey building facade seen from below with a swing stage in place', name: null },
  { id: 'fireproofing-deck', category: 'fireproofing', photo: 'fireproofing', alt: 'Technician in a protective suit spraying fireproofing onto a steel deck', name: null },
  { id: 'firestop-wall', category: 'firestopping', photo: 'firestop', alt: 'Conduits and pipes passing through a firestopped penetration', name: null },
  { id: 'lift', category: 'industrial-caulking', photo: 'lift', alt: 'Premium technician in hi-vis gear on a boom lift beside a building', name: null },
  { id: 'spray', category: 'fireproofing', photo: 'spray', alt: 'Fireproofing being sprayed onto the underside of a steel deck', name: null },
];

// What the CMS holds, or the five stand-in photos above while it holds none.
export const PROJECTS: Project[] = CMS.projects ?? SAMPLE_PROJECTS;

export const categoryByKey = (key: string) => PROJECT_CATEGORIES.find(c => c.key === key);
