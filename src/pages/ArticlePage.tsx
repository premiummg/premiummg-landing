import { Link, useParams } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiClock } from 'react-icons/fi';
import { ColorField, PostCard, SiteButton } from '@premiummg/ui';
import { fill } from '../copy';
import { useT } from '../lang';
import { SORTED_POSTS, categoryLabel, postBySlug } from '../content/posts';
import { serviceByKey } from '../content/services';
import { pick } from '../content/l10n';
import { photo, PLACEHOLDER_IMAGE } from '../content/media';
import { formatDate } from '../lib/format';
import { POST_PATH, SERVICE_PATH } from '../lib/routes';
import { useLinkProps, useLocaleHref } from '../lib/useLocaleHref';
import { Certifications } from '../components/Certifications';
import { ClosingCta } from '../components/ClosingCta';
import { SampleTag } from '../components/home/HomeSections';
import { Section, SectionHeading } from '../components/Section';
import { ACCENT_TEXT, BAND_PANEL, BODY, CARD_ON_PANEL, CONTAINER, INK } from '../components/ui';
import { NotFoundPage } from './NotFoundPage';

export function ArticlePage() {
  const { slug = '' } = useParams();
  const post = postBySlug(slug);
  const { t, lang } = useT();
  const href = useLocaleHref();
  const link = useLinkProps();
  if (!post) return <NotFoundPage />;

  const a = t.articlePage;
  const service = serviceByKey(post.service)!;
  const serviceName = pick(service.name, lang);
  const toc = post.body.filter(b => b.type === 'h2');
  const more = SORTED_POSTS.filter(p => p.slug !== post.slug).slice(0, 3);
  const P = `text-lg leading-[1.75] ${INK}`;

  return (
    <>
      <article aria-labelledby="h-article" className={BAND_PANEL}>
        <header className={`${CONTAINER} pt-12 md:pt-16 pb-10 flex flex-col gap-5`}>
          <div className="flex flex-wrap items-center gap-3">
            <p className={`pmg-eyebrow text-xs ${ACCENT_TEXT}`}>{pick(categoryLabel(post.category), lang)}</p>
            {post.sample && <SampleTag />}
          </div>
          <h1 id="h-article" className={`font-heading font-black text-4xl md:text-5xl lg:text-[56px] leading-[1.06] tracking-tight max-w-4xl text-balance ${INK}`}>
            {pick(post.title, lang)}
          </h1>
          <p className={`text-lg md:text-xl leading-relaxed max-w-3xl ${BODY}`}>{pick(post.excerpt, lang)}</p>
          <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 pt-2 text-[15px] ${BODY}`}>
            <span className="inline-flex items-center gap-2.5">
              <span aria-hidden="true" className="w-10 h-10 rounded-full grid place-items-center bg-(--premium-red-dark) text-white font-heading font-extrabold text-sm">PG</span>
              <span className={`font-heading font-bold ${INK}`}>{a.authorPlaceholder}</span>
            </span>
            <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
            <span className="inline-flex items-center gap-1.5"><FiClock size={16} aria-hidden="true" /> {fill(t.blogPage.minRead, { n: post.readMinutes })}</span>
          </div>
        </header>

        <figure className={`${CONTAINER} flex flex-col gap-3`}>
          <img
            src={post.photo ? photo(post.photo) : PLACEHOLDER_IMAGE}
            alt={post.photoAlt}
            width={1200}
            height={514}
            className="w-full aspect-[21/9] object-cover rounded-2xl"
          />
          {post.photoCaption && <figcaption className={`text-sm ${BODY}`}>{pick(post.photoCaption, lang)}</figcaption>}
        </figure>

        <div className={`${CONTAINER} pt-14 pb-20 md:pb-24 flex flex-wrap items-start gap-x-18 gap-y-12`}>
          <div className="flex-[999_1_560px] min-w-0 max-w-3xl flex flex-col gap-6">
            {post.body.map((block, i) => {
              switch (block.type) {
                case 'p':
                  return <p key={i} className={P}>{pick(block.text, lang)}</p>;
                case 'h2':
                  return <h2 key={i} id={block.id} className={`scroll-mt-32 mt-4 font-heading font-black text-2xl md:text-3xl leading-tight ${INK}`}>{pick(block.text, lang)}</h2>;
                case 'quote':
                  return (
                    <blockquote key={i} className={`pmg-bracket my-2 font-heading font-extrabold text-xl md:text-2xl leading-snug text-balance ${INK}`}>
                      {pick(block.text, lang)}
                    </blockquote>
                  );
                case 'list':
                  return (
                    <ul key={i} className="flex flex-col gap-3">
                      {block.items.map((it, k) => (
                        <li key={k} className={`flex items-start gap-3 text-[17px] leading-relaxed ${INK}`}>
                          <span className="w-6.5 h-6.5 mt-0.5 shrink-0 rounded-lg grid place-items-center bg-(--premium-red-light) dark:bg-(--premium-red)/20">
                            <FiCheck size={15} aria-hidden="true" className={ACCENT_TEXT} />
                          </span>
                          {pick(it, lang)}
                        </li>
                      ))}
                    </ul>
                  );
                case 'takeaways':
                  return (
                    <aside key={i} aria-labelledby="h-takeaways" className="mt-4 p-8 flex flex-col gap-3 bg-(--premium-light-grey) dark:bg-(--premium-steel-grey)" style={{ clipPath: 'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)' }}>
                      <h2 id="h-takeaways" className={`font-heading font-black text-xl ${INK}`}>{a.keyTakeaways}</h2>
                      <p className={`text-base leading-relaxed ${BODY}`}>{pick(block.text, lang)}</p>
                    </aside>
                  );
              }
            })}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-white/10">
              <Link to={href('/blog')} className={`inline-flex items-center gap-2 min-h-11 font-heading font-bold text-sm ${ACCENT_TEXT} hover:underline`}>{a.back}</Link>
            </div>
          </div>

          <aside aria-label={a.inThisArticle} className="flex-[1_1_280px] max-w-sm flex flex-col gap-6 lg:sticky lg:top-36">
            {toc.length > 0 && (
              <nav aria-labelledby="h-toc" className={`p-6 rounded-2xl ${CARD_ON_PANEL} flex flex-col gap-3`}>
                <p id="h-toc" className={`pmg-eyebrow text-xs ${ACCENT_TEXT}`}>{a.inThisArticle}</p>
                <ol className="flex flex-col">
                  {toc.map(h => h.type === 'h2' && (
                    <li key={h.id}><a href={`#${h.id}`} className={`flex items-center min-h-10 text-[15px] ${INK} hover:underline`}>{pick(h.text, lang)}</a></li>
                  ))}
                </ol>
              </nav>
            )}
            <ColorField className="rounded-2xl">
              <div className="p-7 flex flex-col gap-3.5">
                <h2 className="font-heading font-black text-xl leading-tight">{fill(a.ctaTitle, { name: serviceName.toLowerCase() })}</h2>
                <p className="text-[15px] leading-relaxed text-white/90">{t.services.unsure.body}</p>
                <SiteButton variant="onRed" {...link(SERVICE_PATH(service.key))} className="self-start">
                  {fill(a.cta, { name: serviceName })} <FiArrowRight size={16} aria-hidden="true" />
                </SiteButton>
              </div>
            </ColorField>
            <div className={`p-6 rounded-2xl ${CARD_ON_PANEL} flex flex-col gap-3.5`}>
              <p className={`pmg-eyebrow text-xs ${ACCENT_TEXT}`}>{t.footer.certified}</p>
              <Certifications size="sm" bordered />
            </div>
          </aside>
        </div>
      </article>

      <Section tone="ground" labelledBy="h-more">
        <SectionHeading id="h-more" eyebrow={t.blogPreview.eyebrow} title={a.keepReading} />
        <ul className="grid gap-6 mt-10 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
          {more.map(p => {
            const { href: to, onNavigate } = link(POST_PATH(p.slug));
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
                  readTime={fill(t.blogPage.minRead, { n: p.readMinutes })}
                  href={to}
                  onNavigate={onNavigate}
                  className="h-full"
                />
              </li>
            );
          })}
        </ul>
      </Section>
      <ClosingCta />
    </>
  );
}
