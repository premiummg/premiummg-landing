import type { Lang } from '../copy';

// Content that lives outside copy.ts (services, posts, the team) carries both
// languages side by side, one record per item, so an article or a service can
// never exist in one language and be missing in the other.
export type L<T = string> = { en: T; fr: T };

export const pick = <T,>(value: L<T>, lang: Lang): T => value[lang];
