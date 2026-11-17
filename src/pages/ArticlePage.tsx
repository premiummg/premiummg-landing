import { Link, useParams } from 'react-router-dom';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { ColorField, PostCard, SiteButton } from '@premiummg/ui';
import { fill } from '../copy';
import { useT } from '../lang';
import { SORTED_POSTS, categoryLabel, postBySlug } from '../content/posts';
import { serviceByKey } from '../content/services';
import { pick } from '../content/l10n';
import { imageSrc, PLACEHOLDER_IMAGE } from '../content/media';
import { formatDate } from '../lib/format';
import { Blocks } from '../components/Blocks';
import { ShareButtons } from '../components/ShareButtons';
import { POST_PATH, SERVICE_PATH, localePath } from '../lib/routes';
import { COMPANY_NAME, SITE_URL } from '../site';
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
  const service = post.service ? serviceByKey(post.service) ?? null : null;
  const serviceName = service ? pick(service.name, lang) : '';
  const author = post.author ?? (post.sample ? a.authorPlaceholder : COMPANY_NAME);
  const authorInitials = post.author
    ? post.author.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : 'PG';
  const toc = post.body.filter(b => b.type === 'h2');
  const more = SORTED_POSTS.filter(p => p.slug !== post.slug).slice(0, 3);

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
              <span aria-hidden="true" className="w-10 h-10 rounded-full grid place-items-center bg-(--premium-red-dark) text-white font-heading font-extrabold text-sm">{authorInitials}</span>
              <span className={`font-heading font-bold ${INK}`}>{author}</span>
            </span>
            <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
            <span className="inline-flex items-center gap-1.5"><FiClock size={16} aria-hidden="true" /> {fill(t.blogPage.minRead, { n: post.readMinutes })}</span>
          </div>
        </header>

        <figure className={`${CONTAINER} flex flex-col gap-3`}>
          <img
            src={imageSrc(post) ?? PLACEHOLDER_IMAGE}
            alt={post.photoAlt}
            width={1200}
            height={514}
            className="w-full aspect-21/9 object-cover rounded-2xl"
          />
          {post.photoCaption && <figcaption className={`text-sm ${BODY}`}>{pick(post.photoCaption, lang)}</figcaption>}
        </figure>

        <div className={`${CONTAINER} pt-14 pb-20 md:pb-24 flex flex-wrap items-start gap-x-18 gap-y-12`}>
          <div className="flex-[999_1_560px] min-w-0 max-w-3xl flex flex-col gap-6">
            <Blocks blocks={post.body} title={pick(post.title, lang)} />
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 pt-6 border-t border-gray-200 dark:border-white/10">
              <ShareButtons
                url={`${SITE_URL}${localePath(lang, POST_PATH(post.slug))}`} title={pick(post.title, lang)}
                label={a.share} copyLabel={a.copyLink} copiedLabel={a.copied} newTab={a.newTab}
              />
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
                <h2 className="font-heading font-black text-xl leading-tight">{service ? fill(a.ctaTitle, { name: serviceName.toLowerCase() }) : a.ctaTitleGeneral}</h2>
                <p className="text-[15px] leading-relaxed text-white/90">{service ? t.services.unsure.body : a.ctaBodyGeneral}</p>
                <SiteButton variant="onRed" {...link(service ? SERVICE_PATH(service.key) : '/contact')} className="self-start">
                  {service ? fill(a.cta, { name: serviceName }) : t.nav.cta} <FiArrowRight size={16} aria-hidden="true" />
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
                  imageSrc={imageSrc(p)}
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
