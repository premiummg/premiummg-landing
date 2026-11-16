import type { Lang } from '../copy';

// The horizontal Premium wordmark, served from public/media rather than
// through @premiummg/ui's PremiumLogo, which inlines every logo variant into
// the JavaScript bundle as base64 (~220 KB): the cost of the whole logo kit
// on every page, for one 16 KB image. The tagline is part of the artwork, so
// French is its own file. The kit has no reversed version (pg. 11 forbids
// recolouring the mark), so a dark surface gets the dark-surface artwork.
//
// surface="theme": the surface flips with the theme (the nav), so both files
// are rendered and the `dark:` variant picks one with no script involved.
// surface="dark": a surface that is dark in both themes (the footer).
export function Logo({ lang, surface, className = '' }: { lang: Lang; surface: 'theme' | 'dark'; className?: string }) {
  const suffix = lang === 'fr' ? '-fr' : '';
  const src = (tone: 'light' | 'dark') => `/media/logo-horizontal-${tone}${suffix}.png`;
  const alt = lang === 'fr' ? 'Premium, bâti avec cœur' : 'Premium, Built With Heart';
  const img = 'w-auto object-contain';
  if (surface === 'dark') {
    return <img src={src('dark')} alt={alt} width={799} height={207} className={`${img} ${className}`} />;
  }
  return (
    <>
      <img src={src('light')} alt={alt} width={799} height={207} className={`${img} dark:hidden ${className}`} />
      <img src={src('dark')} alt={alt} width={799} height={207} className={`${img} hidden dark:block ${className}`} />
    </>
  );
}
