import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { PhotoTile } from '@premiummg/ui';
import { fill } from '../copy';
import { useT } from '../lang';
import { PROJECTS, PROJECT_CATEGORIES } from '../content/projects';
import { pick } from '../content/l10n';
import { photo, PLACEHOLDER_IMAGE } from '../content/media';
import { SERVICE_PATH } from '../lib/routes';
import { useLocaleHref } from '../lib/useLocaleHref';
import { ClosingCta } from '../components/ClosingCta';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { ACCENT_TEXT, BODY, INK } from '../components/ui';

// The live gallery has three categories with photos (caulking 15,
// fireproofing 12, firestopping 3) and no captions. Each category gets its
// own band here; until the real files are added, the photos in this repo fill
// the first tiles and the rest are visible placeholders.
export function ProjectsPage() {
  const { t, lang } = useT();
  const href = useLocaleHref();
  const p = t.projectsPage;
  const withPhotos = PROJECT_CATEGORIES.filter(c => c.liveCount > 0 || PROJECTS.some(x => x.category === c.key));

  return (
    <>
      <PageHeader eyebrow={p.eyebrow} title={p.title} sub={p.sub}>
        <nav aria-label={p.jump} className="flex flex-wrap gap-2.5 pt-2">
          {withPhotos.map(c => (
            <a key={c.key} href={`#${c.key}`} className="inline-flex items-center gap-2 min-h-11 px-4.5 rounded-full border border-white/70 hover:border-white font-heading font-bold text-[13px] text-white">
              {pick(c.label, lang)}
            </a>
          ))}
        </nav>
      </PageHeader>

      {withPhotos.map((c, i) => {
        const photos = PROJECTS.filter(x => x.category === c.key);
        const placeholders = Math.max(0, Math.min(c.liveCount, 4) - photos.length);
        const name = pick(c.label, lang);
        return (
          <Section key={c.key} id={c.key} tone={i % 2 ? 'ground' : 'panel'} labelledBy={`h-${c.key}`} className="scroll-mt-32">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 id={`h-${c.key}`} className={`font-heading font-black text-3xl md:text-4xl ${INK}`}>{name}</h2>
              {c.liveCount > 0 && (
                <p className={`text-[15px] ${BODY}`}><span className={`pmg-figure font-extrabold ${INK}`}>{c.liveCount}</span> {p.count}</p>
              )}
            </div>
            <div className="grid gap-4 mt-8 grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] auto-rows-[240px]">
              {photos.map((x, k) => (
                <PhotoTile
                  key={x.id}
                  imageSrc={photo(x.photo)}
                  imageAlt={x.alt}
                  title={x.name ? pick(x.name, lang) : t.projects.namePlaceholder}
                  size={k === 0 && photos.length + placeholders > 2 ? 'feature' : 'default'}
                />
              ))}
              {Array.from({ length: placeholders }, (_, k) => (
                <PhotoTile
                  key={`ph-${k}`}
                  imageSrc={PLACEHOLDER_IMAGE}
                  imageAlt={`${t.placeholder}: ${fill(p.fromGallery, { name })}`}
                  eyebrow={t.placeholder}
                  title={fill(p.fromGallery, { name })}
                />
              ))}
            </div>
            <Link to={href(SERVICE_PATH(c.service))} className={`inline-flex items-center gap-2 min-h-11 mt-6 font-heading font-bold text-sm ${ACCENT_TEXT} hover:underline`}>
              {p.aboutService}: {name} <FiArrowRight aria-hidden="true" />
            </Link>
          </Section>
        );
      })}
      <ClosingCta />
    </>
  );
}
