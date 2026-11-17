// Every photo in public/media exists as a WebP sized for how it is displayed,
// next to the JPEG it came from. The JPEGs stay: they are what og:image and
// the JSON-LD point at, because several link-preview scrapers still don't
// read WebP.
import { CMS } from './cms';

export const MEDIA = '/media';
export const media = (file: string) => `${MEDIA}/${file}`;
export const webp = (file: string) => media(file.replace(/\.(jpe?g|png)$/i, '.webp'));

// Premium's own site photography, re-encoded from premiummg.ca.
export const PHOTOS = {
  facade: 'work-facade.jpg',
  fireproofing: 'work-fireproofing.jpg',
  firestop: 'work-firestop.jpg',
  lift: 'work-lift.jpg',
  spray: 'hero-poster.jpg',
  denis: 'denis.jpg',
} as const;
export type PhotoKey = keyof typeof PHOTOS;

// Intrinsic sizes, so an <img> that is not absolutely positioned reserves its
// box before the file arrives (no layout shift).
export const PHOTO_SIZE: Record<PhotoKey, { width: number; height: number }> = {
  facade: { width: 1200, height: 800 },
  fireproofing: { width: 1200, height: 799 },
  firestop: { width: 1200, height: 599 },
  lift: { width: 1200, height: 800 },
  spray: { width: 1280, height: 720 },
  denis: { width: 800, height: 1200 },
};

// The Studio's Media document can replace any of these: its URL when an editor
// uploaded one, otherwise the bundled file. An empty field keeps the bundled
// photo, so nothing on the site can end up without a picture.
export const photo = (key: PhotoKey) => CMS.media?.photos?.[key] ?? webp(PHOTOS[key]);

/** The same, as an absolute-able JPEG for link previews and structured data. */
export const photoJpg = (key: PhotoKey) => {
  const u = CMS.media?.photos?.[key];
  return u ? `${u}&fm=jpg` : media(PHOTOS[key]);
};

/** The logo of one of the four certifications. */
export const certLogo = (c: { key: string; file: string }) => CMS.media?.certs?.[c.key] ?? media(c.file);

/** The home hero's film. */
export const HERO_VIDEO = CMS.media?.heroVideo ?? media('hero.mp4');

// An article's or project's picture: the CMS's own URL when an editor uploaded
// one, otherwise one of the bundled photos.
export const imageSrc = (item: { photo: PhotoKey | null; photoUrl?: string }) =>
  item.photoUrl ?? (item.photo ? photo(item.photo) : undefined);

export const CERTS = [
  { key: 'ul', file: 'cert-ul.jpg', href: 'https://www.ul.com/' },
  { key: 'fcia', file: 'cert-fcia.jpg', href: 'https://www.fcia.org/' },
  { key: 'cor', file: 'cert-cor.jpg', href: 'https://nbcsa.ca/programs/cor/' },
  { key: 'nfca', file: 'cert-nfca.jpg', href: 'https://nfca.memberclicks.net/' },
] as const;
export type CertKey = (typeof CERTS)[number]['key'];

// Shown where Premium has no photograph yet (drywall): the brand's steel grey
// with the 45deg hatch, so a missing photo reads as a gap to fill, not as a
// broken image.
export const PLACEHOLDER_IMAGE = media('placeholder.svg');
