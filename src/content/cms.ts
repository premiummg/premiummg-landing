import type { Post } from './posts';
import type { Project } from './projects';
import type { SocialProfile } from './social';

// What scripts/fetch-cms.mjs pulled from Sanity at build time, already in the
// shapes of Post[] and Project[]. A `null` means "the CMS has none of these
// yet": posts.ts and projects.ts then keep their built-in sample content.
//
// The file is gitignored and written by the build, so it is read through a
// glob: a fresh clone that has not run the script still compiles and runs.
interface CmsContent { posts: Post[] | null; projects: Project[] | null; social: SocialProfile[] | null }

const files = import.meta.glob<CmsContent>('./cms.generated.json', { eager: true, import: 'default' });

export const CMS: CmsContent = Object.values(files)[0] ?? { posts: null, projects: null, social: null };
