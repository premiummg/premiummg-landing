import { useMemo, useState } from 'react';
import { FiAlertTriangle, FiArrowRight, FiAward, FiCheck, FiCheckCircle, FiClock, FiFileText, FiMapPin, FiMail, FiPhone, FiTag } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import {
  ColorField, Eyebrow, FeatureCard, MediaCard, NumberedCard, PhotoTile, PortraitFigure, PostCard, QuoteCard, Reveal, SiteButton,
} from '@premiummg/ui';
import { fill } from '../../copy';
import { useT } from '../../lang';
import { CERTS, PLACEHOLDER_IMAGE, imageSrc, media, photo } from '../../content/media';
import { SERVICES } from '../../content/services';
import { PROJECTS, PROJECT_CATEGORIES } from '../../content/projects';
import { SORTED_POSTS, categoryLabel } from '../../content/posts';
import { pick } from '../../content/l10n';
import { formatDate } from '../../lib/format';
import { POST_PATH, SERVICE_PATH } from '../../lib/routes';
import { useLinkProps } from '../../lib/useLocaleHref';
import { COMPANY_EMAIL, PHONE_DISPLAY, PHONE_E164 } from '../../site';
import { Certifications } from '../Certifications';
import { EstimateForm } from '../EstimateForm';
import { Section, SectionHeading } from '../Section';
import { ACCENT_TEXT, BODY, CARD_ON_GROUND, CARD_ON_PANEL, CONTAINER, INK, SECTION_PAD } from '../ui';

// The four marks, larger, each with its full name: a UL badge at 60px is a
// small red square to anyone who doesn't already know it.
export function Credentials() {
  const { t } = useT();
  return (
    <Section id="certifications" labelledBy="h-cred">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <Reveal className="flex flex-col gap-7">
          <SectionHeading id="h-cred" eyebrow={t.credentials.eyebrow} title={t.credentials.title} sub={t.credentials.sub} />
          <ul className="flex flex-col gap-3.5">
            {t.credentials.points.map(p => (
              <li key={p} className={`flex items-start gap-3 font-heading font-bold ${INK}`}>
                <span className="w-7 h-7 shrink-0 rounded-lg grid place-items-center bg-(--premium-red-light) dark:bg-(--premium-red)/20">
                  <FiCheck size={16} aria-hidden="true" className={ACCENT_TEXT} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2">
          {CERTS.map((c, i) => (
            <li key={c.key} className="h-full">
              <Reveal delay={i * 70} className="h-full">
                <a href={c.href} target="_blank" rel="noopener noreferrer" className={`group h-full flex items-center gap-4 p-4 rounded-xl border border-transparent ${CARD_ON_PANEL} hover:border-(--premium-red) hover:shadow-lg motion-safe:hover:-translate-y-1 motion-safe:transition-all motion-safe:duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--premium-red)`}>
                  <span className="w-21 h-21 shrink-0 rounded-lg bg-white p-1.5 grid place-items-center overflow-hidden">
                    <img src={media(c.file)} alt={`${t.certs[c.key].name} logo`} width={260} height={260} loading="lazy" className="max-w-full max-h-full object-contain motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-110" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className={`font-heading font-extrabold ${INK}`}>{t.certs[c.key].name}</span>
                    <span className={`text-[13px] leading-snug ${BODY}`}>{t.certs[c.key].sub}</span>
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

// The three risks on the AMBER channel, not red: amber is attention, red is
// failure (pg. 13), and nothing has gone wrong yet for a visitor who hasn't
// hired anyone. Red stays louder for the one thing to click.
const STAKE_ICONS: IconType[] = [FiClock, FiAlertTriangle, FiFileText];
export function Stakes() {
  const { t } = useT();
  return (
    <Section tone="ground" labelledBy="h-stakes">
      <Reveal><SectionHeading id="h-stakes" eyebrow={t.stakes.eyebrow} title={t.stakes.title} sub={t.stakes.sub} /></Reveal>
      <div className="grid gap-6 md:grid-cols-3 mt-12">
        {t.stakes.items.map((s, i) => {
          const Icon = STAKE_ICONS[i];
          return (
            <Reveal key={s.title} delay={i * 90}>
              <div className={`h-full flex flex-col gap-4 p-7 rounded-2xl ${CARD_ON_GROUND}`}>
                <span className="w-12 h-12 rounded-lg grid place-items-center bg-(--premium-orange)">
                  <Icon size={22} aria-hidden="true" className="text-black" />
                </span>
                <h3 className={`font-heading font-extrabold text-xl leading-tight ${INK}`}>{s.title}</h3>
                <p className={`text-[15px] leading-relaxed ${BODY}`}>{s.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

// Five services don't divide into a grid, so the sixth cell becomes "Not sure
// which you need?": the grid closes, and a visitor who can't tell which trade
// a rated assembly needs (most of them) gets a route to a person.
export function Services() {
  const { t, lang } = useT();
  const link = useLinkProps();
  return (
    <Section id="services" labelledBy="h-services" className="border-t border-gray-200 dark:border-white/10">
      <Reveal><SectionHeading id="h-services" eyebrow={t.services.eyebrow} title={t.services.title} sub={t.services.sub} /></Reveal>
      <div className="grid gap-6 mt-12 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
        {SERVICES.map((s, i) => {
          const name = pick(s.name, lang);
          const { href, onNavigate } = link(SERVICE_PATH(s.key));
          return (
            <Reveal key={s.key} delay={i * 70} className="h-full">
              <MediaCard
                imageSrc={s.photo ? photo(s.photo) : PLACEHOLDER_IMAGE}
                imageAlt={s.photo ? s.photoAlt : `${t.placeholder}: ${s.photoAlt}`}
                title={name}
                aspect="wide"
                tag={String(i + 1).padStart(2, '0')}
                href={href}
                onClick={onNavigate}
                footer={
                  <span className={`inline-flex items-center gap-2 font-heading font-bold text-sm ${ACCENT_TEXT}`}>
                    {t.services.learnMore} <FiArrowRight size={16} aria-hidden="true" />
                  </span>
                }
              >
                {pick(s.card, lang)}
              </MediaCard>
            </Reveal>
          );
        })}
        <Reveal delay={SERVICES.length * 70} className="h-full">
          <ColorField className="h-full rounded-2xl">
            <div className="h-full flex flex-col justify-between gap-6 p-8">
              <div className="flex flex-col gap-3">
                <h3 className="font-heading font-black text-2xl leading-tight">{t.services.unsure.title}</h3>
                <p className="text-base leading-relaxed text-white/90">{t.services.unsure.body}</p>
              </div>
              <SiteButton variant="onRed" {...link('/contact')} className="self-start">
                {t.services.unsure.cta} <FiArrowRight size={16} aria-hidden="true" />
              </SiteButton>
            </div>
          </ColorField>
        </Reveal>
      </div>
    </Section>
  );
}

// Photography is the one thing a contractor has that a competitor can't copy:
// collected on Premium Black it reads as evidence, not decoration. The
// filters are the live gallery's own categories and actually filter.
export function Projects() {
  const { t, lang } = useT();
  const link = useLinkProps();
  const [filter, setFilter] = useState<string>('all');
  const shown = useMemo(() => (filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === filter)), [filter]);
  const pill = (on: boolean) =>
    `min-h-11 px-4.5 rounded-full font-heading font-bold text-[13px] border motion-safe:transition-colors ${
      on ? 'bg-white text-black border-white' : 'text-white border-white/50 hover:border-white'
    }`;

  return (
    <section id="projects" aria-labelledby="h-projects" className="relative bg-(--premium-black)">
      <div className="absolute inset-0 pmg-texture text-white pointer-events-none" />
      <div className={`relative ${CONTAINER} ${SECTION_PAD} flex flex-col gap-10`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal><SectionHeading id="h-projects" tone="dark" eyebrow={t.projects.eyebrow} title={t.projects.title} sub={t.projects.sub} /></Reveal>
          <SiteButton variant="onDark" {...link('/projects')}>{t.projects.viewAll} <FiArrowRight size={16} aria-hidden="true" /></SiteButton>
        </div>
        <div role="group" aria-label={t.projects.filterLabel} className="flex flex-wrap gap-2.5">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={pill(filter === 'all')}>{t.projects.all}</button>
          {PROJECT_CATEGORIES.map(c => (
            <button key={c.key} type="button" aria-pressed={filter === c.key} onClick={() => setFilter(c.key)} className={pill(filter === c.key)}>
              {pick(c.label, lang)}
            </button>
          ))}
        </div>
        {shown.length ? (
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] auto-rows-[260px]">
            {shown.map((p, i) => (
              <PhotoTile
                key={p.id}
                imageSrc={imageSrc(p) ?? PLACEHOLDER_IMAGE}
                imageAlt={p.alt}
                eyebrow={pick(PROJECT_CATEGORIES.find(c => c.key === p.category)!.label, lang)}
                title={p.name ? pick(p.name, lang) : t.projects.namePlaceholder}
                size={i === 0 && shown.length > 2 ? 'feature' : 'default'}
              />
            ))}
          </div>
        ) : (
          <p className="text-white/80">{t.projects.empty}</p>
        )}
      </div>
    </section>
  );
}

export function Story() {
  const { t } = useT();
  const link = useLinkProps();
  return (
    <Section id="story" labelledBy="h-story">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-18 items-center">
        <Reveal className="flex flex-col gap-6">
          <SectionHeading id="h-story" eyebrow={t.story.eyebrow} title={t.story.title} />
          <p className={`text-[17px] leading-relaxed ${BODY}`}>{t.story.body}</p>
          <p className={`text-[17px] leading-relaxed ${BODY}`}>{t.story.body2}</p>
          <dl className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(130px,100%),1fr))] py-6 border-y border-gray-200 dark:border-white/10">
            {t.story.figures.map(f => (
              <div key={f.label} className="flex flex-col-reverse gap-1.5">
                <dt className={`text-sm ${BODY}`}>{f.label}</dt>
                <dd className={`pmg-figure font-black text-5xl leading-none ${ACCENT_TEXT}`}>{f.value}</dd>
              </div>
            ))}
          </dl>
          <SiteButton variant="ghost" {...link('/about')} className="self-start">
            {t.story.cta} <FiArrowRight size={16} aria-hidden="true" />
          </SiteButton>
        </Reveal>
        <Reveal delay={120} className="max-w-md w-full mx-auto lg:mx-0">
          <PortraitFigure imageSrc={photo('denis')} name={t.story.name} role={t.story.role} />
        </Reveal>
      </div>
    </Section>
  );
}

const WHY_ICONS: IconType[] = [FiMapPin, FiAward, FiCheckCircle, FiTag];
export function Why() {
  const { t } = useT();
  return (
    <Section tone="ground" labelledBy="h-why">
      <Reveal><SectionHeading id="h-why" eyebrow={t.why.eyebrow} title={t.why.title} sub={t.why.sub} /></Reveal>
      <div className="grid gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-4">
        {t.why.items.map((w, i) => {
          const Icon = WHY_ICONS[i];
          return (
            <Reveal key={w.title} delay={i * 80} className="h-full">
              <FeatureCard
                title={w.title}
                icon={<span className="w-11 h-11 rounded-lg grid place-items-center bg-(--premium-red-light) dark:bg-(--premium-red)/20"><Icon size={22} aria-hidden="true" className={ACCENT_TEXT} /></span>}
              >
                {w.body}
              </FeatureCard>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

export function Process() {
  const { t } = useT();
  return (
    <Section labelledBy="h-process">
      <Reveal><SectionHeading id="h-process" eyebrow={t.process.eyebrow} title={t.process.title} sub={t.process.sub} /></Reveal>
      <ol className="grid gap-6 mt-12 md:grid-cols-3">
        {t.process.items.map((p, i) => (
          <li key={p.title} className="h-full">
            <Reveal delay={i * 100} className="h-full">
              <NumberedCard number={i + 1} title={p.title} color="var(--premium-red-dark)">{p.body}</NumberedCard>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Testimonials() {
  const { t } = useT();
  return (
    <Section tone="ground" labelledBy="h-reviews">
      <Reveal><SectionHeading id="h-reviews" eyebrow={t.reviews.eyebrow} title={t.reviews.title} /></Reveal>
      <div className="grid gap-6 mt-12 md:grid-cols-2">
        {t.reviews.items.map((r, i) => (
          <Reveal key={r.name} delay={i * 70} className="h-full">
            <QuoteCard quote={r.quote} name={<>{r.name} <span className="font-normal">· {t.reviews.client}</span></>} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function BlogPreview() {
  const { t, lang } = useT();
  const link = useLinkProps();
  return (
    <Section id="blog" labelledBy="h-blog">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal className="flex flex-col gap-4">
          <SectionHeading id="h-blog" eyebrow={t.blogPreview.eyebrow} title={t.blogPreview.title} sub={t.blogPreview.sub} />
          {SORTED_POSTS.some(p => p.sample) && <SampleTag />}
        </Reveal>
        <SiteButton variant="ghost" {...link('/blog')}>{t.blogPreview.viewAll} <FiArrowRight size={16} aria-hidden="true" /></SiteButton>
      </div>
      <div className="grid gap-6 mt-12 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
        {SORTED_POSTS.slice(0, 3).map((p, i) => {
          const { href, onNavigate } = link(POST_PATH(p.slug));
          return (
            <Reveal key={p.slug} delay={i * 80} className="h-full">
              <PostCard
                imageSrc={imageSrc(p)}
                imageAlt={p.photoAlt}
                category={pick(categoryLabel(p.category), lang)}
                title={pick(p.title, lang)}
                excerpt={pick(p.excerpt, lang)}
                date={p.date}
                dateLabel={formatDate(p.date, lang)}
                readTime={fill(t.blogPage.minRead, { n: p.readMinutes })}
                href={href}
                onNavigate={onNavigate}
                className="h-full"
              />
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

export function SampleTag() {
  const { t } = useT();
  return (
    <span className="self-start inline-block px-2 py-1 rounded bg-(--premium-orange) text-black font-heading font-bold uppercase tracking-wider text-[11px]">
      {t.blogPage.sample}
    </span>
  );
}

// The one full-bleed red field on the page, at the point of the whole page:
// the request form itself, with the phone number set as large as a heading
// and the certifications one more time beside it.
export function EstimateBand({ id = 'estimate' }: { id?: string }) {
  const { t } = useT();
  return (
    <section id={id} aria-labelledby="h-estimate">
      <ColorField>
        <div className={`${CONTAINER} ${SECTION_PAD} grid gap-12 lg:grid-cols-2 lg:gap-18 items-center`}>
          <div className="flex flex-col gap-6">
            <Eyebrow text={t.estimate.eyebrow} tone="onColor" className="text-xs text-white!" />
            <h2 id="h-estimate" className="font-heading font-black text-4xl md:text-5xl leading-[1.05] tracking-tight text-balance">{t.estimate.title}</h2>
            <p className="text-lg leading-relaxed text-white/90">{t.estimate.sub}</p>
            <div className="flex flex-col gap-1">
              <a href={`tel:${PHONE_E164}`} className="inline-flex items-center gap-3 min-h-12 font-heading font-black text-2xl md:text-3xl tabular-nums hover:underline">
                <FiPhone size={24} aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
              <a href={`mailto:${COMPANY_EMAIL}`} className="inline-flex items-center gap-3 min-h-11 text-[17px] hover:underline">
                <FiMail size={20} aria-hidden="true" /> {COMPANY_EMAIL}
              </a>
              <p className="inline-flex items-center gap-3 min-h-11 text-[17px]"><FiClock size={20} aria-hidden="true" /> {t.hours}</p>
            </div>
            <div className="flex flex-col gap-3.5 pt-6 border-t border-white/40">
              <p className="pmg-eyebrow text-xs text-white">{t.hero.certified}</p>
              <Certifications />
            </div>
          </div>
          <EstimateForm />
        </div>
      </ColorField>
    </section>
  );
}

