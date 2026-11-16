import { useMemo, useState } from 'react';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { PostCard, SiteButton } from '@premiummg/ui';
import { fill } from '../copy';
import { useT } from '../lang';
import { POST_CATEGORIES, SORTED_POSTS, categoryLabel, type CategoryKey } from '../content/posts';
import { pick } from '../content/l10n';
import { photo, PLACEHOLDER_IMAGE } from '../content/media';
import { formatDate } from '../lib/format';
import { POST_PATH } from '../lib/routes';
import { useLinkProps } from '../lib/useLocaleHref';
import { ClosingCta } from '../components/ClosingCta';
import { SampleTag } from '../components/home/HomeSections';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { ACCENT_TEXT, BAND_PANEL, BODY, CARD_ON_PANEL, CONTAINER, INK } from '../components/ui';

// The blog listing: the newest post featured on its own row, then search and
// category filters over the rest. Everything is in the prerendered HTML; the
// filters only narrow what is already on the page.
export function BlogPage() {
  const { t, lang } = useT();
  const link = useLinkProps();
  const b = t.blogPage;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryKey | 'all'>('all');
  const [featured, ...rest] = SORTED_POSTS;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rest.filter(p =>
      (category === 'all' || p.category === category) &&
      (!q || `${pick(p.title, lang)} ${pick(p.excerpt, lang)}`.toLowerCase().includes(q)),
    );
  }, [rest, category, query, lang]);

  const pill = (on: boolean) =>
    `min-h-11 px-4.5 rounded-full font-heading font-bold text-[13px] border motion-safe:transition-colors ${
      on ? 'bg-(--premium-black) text-white border-(--premium-black) dark:bg-white dark:text-black dark:border-white' : `${INK} border-gray-400 dark:border-white/40 hover:border-(--premium-black) dark:hover:border-white`
    }`;
  const featuredLink = link(POST_PATH(featured.slug));

  return (
    <>
      <PageHeader eyebrow={b.eyebrow} title={b.title} sub={b.sub}>
        {SORTED_POSTS.some(p => p.sample) && <SampleTag />}
      </PageHeader>

      <section aria-labelledby="h-featured" className={BAND_PANEL}>
        <div className={`${CONTAINER} py-16 flex flex-col gap-6`}>
          <h2 id="h-featured" className={`pmg-eyebrow text-xs ${ACCENT_TEXT}`}>{b.featured}</h2>
          <article className={`group grid lg:grid-cols-[1.25fr_1fr] rounded-2xl overflow-hidden ${CARD_ON_PANEL}`}>
            <div className="relative min-h-72 overflow-hidden">
              <img
                src={featured.photo ? photo(featured.photo) : PLACEHOLDER_IMAGE}
                alt={featured.photoAlt}
                className="absolute inset-0 w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="p-7 lg:p-12 flex flex-col justify-center gap-4">
              <p className={`pmg-eyebrow text-xs ${ACCENT_TEXT}`}>{pick(categoryLabel(featured.category), lang)}</p>
              <h3 className={`font-heading font-black text-2xl md:text-3xl leading-tight text-balance ${INK}`}>{pick(featured.title, lang)}</h3>
              <p className={`text-[17px] leading-relaxed ${BODY}`}>{pick(featured.excerpt, lang)}</p>
              <p className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${BODY}`}>
                <time dateTime={featured.date}>{formatDate(featured.date, lang)}</time>
                <span aria-hidden="true">·</span>
                <span>{fill(b.minRead, { n: featured.readMinutes })}</span>
              </p>
              <SiteButton {...featuredLink} className="self-start mt-2">
                {b.readArticle} <FiArrowRight size={16} aria-hidden="true" />
              </SiteButton>
            </div>
          </article>
        </div>
      </section>

      <Section tone="ground" labelledBy="h-latest">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <h2 id="h-latest" className={`font-heading font-black text-3xl md:text-4xl ${INK}`}>{b.latest}</h2>
          <div role="search" className="relative flex-1 basis-64 max-w-sm">
            <label htmlFor="blog-search" className="sr-only">{b.search}</label>
            <FiSearch size={20} aria-hidden="true" className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${BODY}`} />
            <input
              id="blog-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={b.search}
              className="input-field pl-11! bg-white dark:bg-(--premium-steel-grey) border-gray-400! dark:border-white/30! text-(--premium-black) dark:text-white"
            />
          </div>
        </div>
        <div role="group" aria-label={b.filterLabel} className="flex flex-wrap gap-2.5 mt-6">
          <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')} className={pill(category === 'all')}>{b.all}</button>
          {POST_CATEGORIES.map(c => (
            <button key={c.key} type="button" aria-pressed={category === c.key} onClick={() => setCategory(c.key)} className={pill(category === c.key)}>
              {pick(c.label, lang)}
            </button>
          ))}
        </div>
        <div aria-live="polite" className="mt-8">
          {shown.length ? (
            <ul className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
              {shown.map(p => {
                const { href, onNavigate } = link(POST_PATH(p.slug));
                return (
                  <li key={p.slug} className="h-full">
                    <PostCard
                      imageSrc={p.photo ? photo(p.photo) : undefined}
                      imageAlt={p.photoAlt}
                      category={pick(categoryLabel(p.category), lang)}
                      title={pick(p.title, lang)}
                      excerpt={pick(p.excerpt, lang)}
                      date={p.date}
                      dateLabel={formatDate(p.date, lang)}
                      readTime={fill(b.minRead, { n: p.readMinutes })}
                      href={href}
                      onNavigate={onNavigate}
                      className="h-full"
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={`text-lg ${BODY}`}>{b.noResults}</p>
          )}
        </div>
      </Section>
      <ClosingCta />
    </>
  );
}
