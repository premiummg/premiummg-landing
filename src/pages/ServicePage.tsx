import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowRight, FiAward, FiCheckCircle, FiPhone, FiPlus } from 'react-icons/fi';
import { ColorField, Hero, PhotoTile, Reveal } from '@premiummg/ui';
import { useT } from '../lang';
import { SERVICES, serviceByKey, type Item } from '../content/services';
import { PROJECTS, PROJECT_CATEGORIES } from '../content/projects';
import { pick, type L } from '../content/l10n';
import { imageSrc, photo, PLACEHOLDER_IMAGE } from '../content/media';
import { SERVICE_PATH } from '../lib/routes';
import { useLocaleHref } from '../lib/useLocaleHref';
import { PHONE_DISPLAY, PHONE_E164 } from '../site';
import { CertStrip } from '../components/CertStrip';
import { ClosingCta } from '../components/ClosingCta';
import { Section, SectionHeading } from '../components/Section';
import { ACCENT_TEXT, BODY, CARD_ON_GROUND, CARD_ON_PANEL, CONTAINER, INK, SECTION_PAD } from '../components/ui';
import { NotFoundPage } from './NotFoundPage';

// One template for the five services. The live pages are mostly headings
// with a "Learn More" that goes nowhere; here every item says what is
// delivered, the steps are numbered on the brand's 45deg cut, and the page
// ends on the related photos, the other four services and the estimate.
export function ServicePage() {
  const { key = '' } = useParams();
  const service = serviceByKey(key);
  const { t, lang } = useT();
  const href = useLocaleHref();
  if (!service) return <NotFoundPage />;

  const name = pick(service.name, lang);
  let tone: 'panel' | 'ground' = 'ground';
  const nextTone = () => (tone = tone === 'panel' ? 'ground' : 'panel');

  const cards = (items: Item[], icon: 'bracket' | 'check', onTone: 'panel' | 'ground') => (
    <ul className="grid gap-5 mt-11 grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))]">
      {items.map((it, i) => (
        <li key={i} className={`flex flex-col gap-3 p-7 rounded-2xl ${onTone === 'ground' ? CARD_ON_GROUND : CARD_ON_PANEL}`}>
          {icon === 'bracket' ? (
            <span aria-hidden="true" className="w-3 h-4.5 border-l-4 border-t-4 border-(--premium-red-dark) dark:border-[#F0797D]" />
          ) : (
            <span className="w-11 h-11 rounded-lg grid place-items-center bg-(--premium-red-light) dark:bg-(--premium-red)/20">
              <FiCheckCircle size={20} aria-hidden="true" className={ACCENT_TEXT} />
            </span>
          )}
          <h3 className={`font-heading font-extrabold text-lg leading-snug ${INK}`}>{pick(it.title, lang)}</h3>
          <p className={`text-[15px] leading-relaxed ${BODY}`}>{pick(it.body, lang)}</p>
        </li>
      ))}
    </ul>
  );

  const sections: ReactElement[] = [];
  const push = (id: string, eyebrow: string, title: L, body: (onTone: 'panel' | 'ground') => ReactElement) => {
    const onTone = nextTone();
    sections.push(
      <Section key={id} tone={onTone} labelledBy={id}>
        <Reveal><SectionHeading id={id} eyebrow={eyebrow} title={pick(title, lang)} /></Reveal>
        {body(onTone)}
      </Section>,
    );
  };

  if (service.offer) push('h-offer', t.servicePage.scope, service.offer.title, onTone => cards(service.offer!.items, 'bracket', onTone));

  const benefits = () => service.benefits && push('h-benefits', t.servicePage.benefits, service.benefits.title, onTone => (
    <>
      {service.stat && (
        <ColorField className="mt-11 rounded-2xl">
          <div className="p-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="pmg-figure font-black text-6xl leading-none">{service.stat.value}</span>
            <span className="text-lg leading-snug text-white/95 max-w-md">{pick(service.stat.label, lang)}</span>
          </div>
        </ColorField>
      )}
      {cards(service.benefits!.items, 'check', onTone)}
    </>
  ));
  const process = () => service.process && push('h-process', t.servicePage.process, service.process.title, onTone => (
    <ol className="grid gap-5 mt-11 grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))]">
      {service.process!.items.map((it, i) => (
        <li
          key={i}
          className={`flex flex-col gap-3 p-7 ${onTone === 'panel' ? 'bg-(--premium-light-grey) dark:bg-(--premium-steel-grey)' : 'bg-white dark:bg-(--premium-dark-grey)'}`}
          style={{ clipPath: 'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)' }}
        >
          <span aria-hidden="true" className={`pmg-figure font-black text-4xl leading-none ${ACCENT_TEXT}`}>{String(i + 1).padStart(2, '0')}</span>
          <h3 className={`font-heading font-extrabold text-lg leading-snug ${INK}`}>{pick(it.title, lang)}</h3>
          <p className={`text-[15px] leading-relaxed ${BODY}`}>{pick(it.body, lang)}</p>
        </li>
      ))}
    </ol>
  ));
  if (service.benefitsFirst) { benefits(); process(); } else { process(); benefits(); }

  if (service.faq) {
    push('h-faq', t.servicePage.questions, { en: 'FAQ', fr: 'FAQ' }, onTone => (
      <div className="mt-11 max-w-3xl flex flex-col gap-3">
        {service.faq!.map((f, i) => (
          <details key={i} className={`group rounded-xl ${onTone === 'ground' ? CARD_ON_GROUND : CARD_ON_PANEL}`}>
            <summary className={`flex items-center justify-between gap-4 min-h-16 px-6 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-heading font-extrabold text-[17px] ${INK}`}>
              {pick(f.q, lang)}
              <FiPlus size={22} aria-hidden="true" className={`shrink-0 ${ACCENT_TEXT} motion-safe:transition-transform group-open:rotate-45`} />
            </summary>
            <p className={`px-6 pb-6 text-base leading-relaxed ${BODY}`}>{pick(f.a, lang)}</p>
          </details>
        ))}
      </div>
    ));
  }

  const categories = PROJECT_CATEGORIES.filter(c => c.service === service.key).map(c => c.key);
  const related = [...PROJECTS.filter(p => categories.includes(p.category)), ...PROJECTS.filter(p => !categories.includes(p.category))].slice(0, 3);

  return (
    <>
      <Hero
        size="compact"
        wedge
        eyebrow={name}
        title={pick(service.h1, lang)}
        sub={pick(service.intro, lang)}
        imageSrc={service.photo ? photo(service.photo) : PLACEHOLDER_IMAGE}
        primaryAction={{ label: t.nav.cta, href: href('/contact') }}
        secondaryAction={{ label: <span className="inline-flex items-center gap-2"><FiPhone size={15} aria-hidden="true" /> {PHONE_DISPLAY}</span>, href: `tel:${PHONE_E164}` }}
      >
        {service.badge && (
          <p className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-(--premium-orange) text-black font-heading font-extrabold text-[15px]">
            <FiAward size={20} aria-hidden="true" /> {pick(service.badge, lang)}
          </p>
        )}
        {!service.photo && (
          <p className="inline-block px-2 py-1 rounded bg-(--premium-orange) text-black font-heading font-bold uppercase tracking-wider text-[11px]">
            {t.servicePage.photoNeeded}
          </p>
        )}
      </Hero>
      <CertStrip />
      {sections}

      <section aria-labelledby="h-related" className="relative bg-(--premium-black)">
        <div className="absolute inset-0 pmg-texture text-white pointer-events-none" />
        <div className={`relative ${CONTAINER} ${SECTION_PAD} flex flex-col gap-10`}>
          <SectionHeading id="h-related" tone="dark" eyebrow={t.projects.eyebrow} title={t.servicePage.related} />
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] auto-rows-[280px]">
            {related.map(p => (
              <PhotoTile
                key={p.id}
                imageSrc={imageSrc(p) ?? PLACEHOLDER_IMAGE}
                imageAlt={p.alt}
                eyebrow={pick(PROJECT_CATEGORIES.find(c => c.key === p.category)!.label, lang)}
                title={p.name ? pick(p.name, lang) : t.projects.namePlaceholder}
              />
            ))}
          </div>
          <Link to={href('/projects')} className="self-start inline-flex items-center gap-2 min-h-11 font-heading font-bold text-white hover:underline">
            {t.projects.viewAll} <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <Section labelledBy="h-other">
        <SectionHeading id="h-other" eyebrow={t.servicePage.otherEyebrow} title={t.servicePage.other} />
        <ul className="grid gap-4 mt-10 grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))]">
          {SERVICES.filter(s => s.key !== service.key).map(s => (
            <li key={s.key}>
              <Link
                to={href(SERVICE_PATH(s.key))}
                className={`flex items-center justify-between gap-4 min-h-19 px-6 py-5 rounded-xl ${CARD_ON_PANEL} font-heading font-extrabold text-lg ${INK} hover:-translate-y-0.5 hover:shadow-md motion-safe:transition-all`}
              >
                {pick(s.name, lang)} <FiArrowRight size={20} aria-hidden="true" className={ACCENT_TEXT} />
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <ClosingCta />
    </>
  );
}
