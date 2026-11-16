import { CMS } from './cms';

// The company's social profiles, edited in the Studio (Site settings). Empty
// until someone adds them: the site never invents an address.
export const SOCIAL_PLATFORMS = {
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X',
} as const;
export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;

export interface SocialProfile { platform: SocialPlatform; url: string }

export const SOCIAL: SocialProfile[] = CMS.social ?? [];
