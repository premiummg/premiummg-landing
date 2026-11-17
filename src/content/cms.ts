import type { Post } from './posts';
import type { Project } from './projects';
import type { SocialProfile } from './social';
import type { Service } from './services';
import type { LegalSection } from './legal';
import type { L } from './l10n';
import type { PhotoKey } from './media';

// What scripts/fetch-cms.mjs pulled from Sanity at build time, already in the
// shapes of Post[] and Project[]. A `null` means "the CMS has none of these
// yet": posts.ts and projects.ts then keep their built-in sample content.
//
// The file is gitignored and written by the build, so it is read through a
// glob: a fresh clone that has not run the script still compiles and runs.
interface CmsContent {
  posts: Post[] | null;
  projects: Project[] | null;
  social: SocialProfile[] | null;
  // The page wording edited in the Studio, a partial copy tree per language.
  copy: { en: unknown; fr: unknown } | null;
  // Per service key: the fields its Studio document sets (see applyServiceOverride).
  services: Record<string, Partial<Service>> | null;
  team: { title: L; people: { name: string; role: L }[] }[] | null;
  credentials: { items: { key: string; title: L; body: L }[] | null; affiliations: string[] | null } | null;
  legal: Record<string, { updated?: L; sections: LegalSection[] | null }> | null;
  // Pictures an editor uploaded in Media (each optional: empty keeps the bundled one).
  media: { photos?: Partial<Record<PhotoKey, string>>; certs?: Record<string, string>; heroVideo?: string } | null;
}

const files = import.meta.glob<CmsContent>('./cms.generated.json', { eager: true, import: 'default' });

export const CMS: CmsContent = Object.values(files)[0] ?? {
  posts: null, projects: null, social: null, copy: null, services: null, team: null, credentials: null, legal: null, media: null,
};
