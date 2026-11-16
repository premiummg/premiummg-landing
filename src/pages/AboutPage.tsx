import { FiAlertTriangle, FiAward, FiClock } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { Hero, PortraitFigure, Reveal, initials } from '@premiummg/ui';
import { useT } from '../lang';
import { TEAM, CREDENTIALS, AFFILIATIONS } from '../content/team';
import { CERTS, media, photo, PLACEHOLDER_IMAGE } from '../content/media';
import { pick } from '../content/l10n';
import { useLocaleHref } from '../lib/useLocaleHref';
import { Breadcrumb } from '../components/Breadcrumb';
import { ClosingCta } from '../components/ClosingCta';
import { Section, SectionHeading } from '../components/Section';
import { ACCENT_TEXT, BODY, CARD_ON_GROUND, CARD_ON_PANEL, INK } from '../components/ui';

function PlaceholderTag({ text }: { text: string }) {
  return (
    <span className="self-start inline-block px-2 py-1 rounded bg-(--premium-orange) text-black font-heading font-bold uppercase tracking-wider text-[11px]">
      {text}
    </span>
  );
}

const PILLAR_ICONS: IconType[] = [FiAlertTriangle, FiAward, FiClock];

export function AboutPage() {
  const { t, lang } = useT();
  const href = useLocaleHref();
  const a = t.aboutPage;

  return (
    <>
      <Hero
        size="compact"
        wedge
        eyebrow={a.eyebrow}
        title={a.title}
        sub={a.sub}
        imageSrc={photo('lift')}
        breadcrumb={<Breadcrumb trail={[{ label: t.nav.about }]} />}
        primaryAction={{ label: t.nav.cta, href: href('/contact') }}
      />

      <Section labelledBy="h-story">
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
          </Reveal>
          <Reveal delay={120} className="max-w-md w-full mx-auto lg:mx-0">
            <PortraitFigure imageSrc={photo('denis')} name={t.story.name} role={lang === 'fr' ? 'Fondateur | Chef de la direction' : 'Founder | CEO'} />
          </Reveal>
        </div>
      </Section>

      <Section tone="ground" labelledBy="h-commit">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-18 items-center">
          <div className="flex flex-col gap-7">
            <SectionHeading id="h-commit" eyebrow={a.commitment.eyebrow} title={a.commitment.title} sub={a.commitment.sub} />
            <ul className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))]">
              {a.commitment.pillars.map((p, i) => {
                const Icon = PILLAR_ICONS[i];
                return (
                  <li key={p} className={`flex items-center gap-3.5 p-4 rounded-xl ${CARD_ON_GROUND} font-heading font-extrabold text-lg ${INK}`}>
                    <span className="w-11 h-11 shrink-0 rounded-lg grid place-items-center bg-(--premium-orange)"><Icon size={20} aria-hidden="true" className="text-black" /></span>
                    {p}
                  </li>
                );
              })}
            </ul>
          </div>
          <figure className="flex flex-col gap-3">
            <img src={PLACEHOLDER_IMAGE} alt={`${t.placeholder}: ${a.commitment.teamPhoto}`} width={1200} height={750} className="w-full aspect-4/3 object-cover rounded-2xl" />
            <PlaceholderTag text={`${t.placeholder}: ${a.commitment.teamPhoto}`} />
          </figure>
        </div>
      </Section>

      <Section labelledBy="h-team">
        <div className="flex flex-col gap-4">
          <SectionHeading id="h-team" eyebrow={a.team.eyebrow} title={a.team.title} />
          <PlaceholderTag text={a.team.portraitsNeeded} />
        </div>
        <div className="flex flex-col gap-10 mt-11">
          {TEAM.map(group => (
            <div key={group.title.en} className="flex flex-col gap-4">
              <h3 className={`pmg-eyebrow text-xs ${ACCENT_TEXT}`}>{pick(group.title, lang)}</h3>
              <ul className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
                {group.people.map(person => (
                  <li key={person.name} className={`flex items-center gap-4 p-5 rounded-2xl ${CARD_ON_PANEL}`}>
                    {person.name === 'Denis Collin' ? (
                      <img src={photo('denis')} alt="" width={800} height={1200} className="w-18 h-18 shrink-0 rounded-xl object-cover object-top" />
                    ) : (
                      <span aria-hidden="true" className="w-18 h-18 shrink-0 rounded-xl grid place-items-center bg-(--premium-steel-grey) text-white font-heading font-extrabold text-xl">
                        {initials(person.name)}
                      </span>
                    )}
                    <span className="flex flex-col gap-1 min-w-0">
                      <span className={`font-heading font-extrabold text-lg ${INK}`}>{person.name}</span>
                      <span className={`text-sm leading-snug ${BODY}`}>{pick(person.role, lang)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="ground" id="credentials" labelledBy="h-creds">
        <SectionHeading id="h-creds" eyebrow={a.credentials.eyebrow} title={a.credentials.title} sub={a.credentials.sub} />
        <ul className="grid gap-6 mt-11 grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))]">
          {CREDENTIALS.map(c => {
            const cert = CERTS.find(x => x.key === c.key)!;
            return (
              <li key={c.key}>
                <a href={cert.href} target="_blank" rel="noopener noreferrer" className={`h-full flex flex-col gap-4 p-7 rounded-2xl ${CARD_ON_GROUND} hover:-translate-y-1 hover:shadow-lg motion-safe:transition-all`}>
                  <span className="w-28 h-28 rounded-xl bg-white p-2 grid place-items-center border border-gray-200">
                    <img src={media(cert.file)} alt={`${t.certs[c.key].name} logo`} width={260} height={260} loading="lazy" className="max-w-full max-h-full object-contain" />
                  </span>
                  <span className={`font-heading font-extrabold text-lg leading-snug ${INK}`}>{pick(c.title, lang)}</span>
                  <span className={`text-[15px] leading-relaxed ${BODY}`}>{pick(c.body, lang)}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section labelledBy="h-affil">
        <div className="flex flex-col gap-4">
          <SectionHeading id="h-affil" eyebrow={a.affiliation.eyebrow} title={a.affiliation.title} sub={a.affiliation.sub} />
          <PlaceholderTag text={a.affiliation.logosNeeded} />
        </div>
        <ul className="grid gap-4 mt-10 grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))]">
          {AFFILIATIONS.map(n => (
            <li key={n} className={`min-h-24 p-4 grid place-items-center text-center rounded-xl border border-dashed border-gray-400 dark:border-white/40 font-heading font-extrabold ${INK}`}>
              {n}
            </li>
          ))}
        </ul>
      </Section>
      <ClosingCta />
    </>
  );
}

