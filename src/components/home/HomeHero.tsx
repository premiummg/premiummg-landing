import { useNavigate } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';
import { Hero, StatBand } from '@premiummg/ui';
import { useT } from '../../lang';
import { media, photo } from '../../content/media';
import { useLocaleHref } from '../../lib/useLocaleHref';
import { Certifications } from '../Certifications';

// The hero film from the landing proposal (hero.mp4: muted, 720p, 1.9 MB, the
// same film the live site streams from YouTube, self-hosted). hero-poster.jpg
// is its first frame: it carries the hero until the film is ready and is all a
// reduced-motion visitor gets. Premium's own 45deg wedge is on
// (this IS a Premium page), the certifications sit inside the hero where the
// qualifying decision is made, and the figures follow immediately below.
export function HomeHero() {
  const { t } = useT();
  const href = useLocaleHref();
  const navigate = useNavigate();
  const go = (path: string) => ({ href: href(path), onClick: () => navigate(href(path)) });

  return (
    <>
      <Hero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        sub={t.hero.sub}
        imageSrc={photo('spray')}
        videoSrc={media('hero.mp4')}
        wedge
        primaryAction={{ label: t.hero.cta, ...go('/contact') }}
        secondaryAction={{ label: t.hero.alt, ...go('/projects') }}
        caption={<span className="inline-flex items-center gap-2 text-sm text-white/85"><FiMapPin size={14} aria-hidden="true" className="text-(--premium-orange)" /> {t.area}</span>}
      >
        <div className="flex flex-col gap-4 pt-6 border-t border-white/30">
          <p className="pmg-eyebrow text-xs text-white">{t.hero.certified}</p>
          <Certifications size="lg" />
        </div>
      </Hero>
      <StatBand
        label={t.stats.label}
        items={t.stats.items.map(s => ({
          value: s.value,
          label: s.label,
          highlight: !!s.placeholder,
          note: s.placeholder ? (
            <span className="inline-block px-2 py-1 rounded bg-(--premium-orange) text-black font-heading font-bold uppercase tracking-wider text-[11px]">
              {t.placeholder}
            </span>
          ) : undefined,
        }))}
      />
    </>
  );
}
