import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useT } from '../lang';
import { LEGAL } from '../content/legal';
import { pick } from '../content/l10n';
import { useLocaleHref } from '../lib/useLocaleHref';
import { COMPANY_EMAIL } from '../site';
import { PageHeader } from '../components/PageHeader';
import { ACCENT_TEXT, BAND_PANEL, BODY, CARD_ON_PANEL, CONTAINER, INK } from '../components/ui';

export function LegalPage({ doc }: { doc: 'terms' | 'privacy' }) {
  const { t, lang } = useT();
  const href = useLocaleHref();
  const d = LEGAL[doc];
  const other = doc === 'terms' ? 'privacy' : 'terms';
  const title = doc === 'terms' ? t.seo.terms.title.split(' | ')[0] : t.footer.privacy;
  const otherTitle = other === 'terms' ? t.seo.terms.title.split(' | ')[0] : t.footer.privacy;

  return (
    <>
      <PageHeader crumb={[{ label: title }]} eyebrow={t.legal.eyebrow} title={title} sub={pick(d.updated, lang)} />
      <section aria-label={title} className={BAND_PANEL}>
        <div className={`${CONTAINER} pt-16 pb-22 flex flex-wrap items-start gap-x-18 gap-y-10`}>
          <nav aria-labelledby="h-onpage" className={`flex-[1_1_260px] max-w-sm p-6 rounded-2xl ${CARD_ON_PANEL} flex flex-col gap-3 lg:sticky lg:top-36`}>
            <p id="h-onpage" className={`pmg-eyebrow text-xs ${ACCENT_TEXT}`}>{t.legal.onThisPage}</p>
            <ol className="flex flex-col">
              {d.sections.map((s, i) => (
                <li key={i}>
                  <a href={`#s-${i + 1}`} className={`flex items-center gap-2.5 min-h-10 text-[15px] ${INK} hover:underline`}>
                    <span className={`pmg-figure font-extrabold ${ACCENT_TEXT}`}>{String(i + 1).padStart(2, '0')}</span>
                    {pick(s, lang)}
                  </a>
                </li>
              ))}
            </ol>
            <Link to={href(LEGAL[other].path)} className={`inline-flex items-center gap-2 min-h-11 mt-2 pt-4 border-t border-gray-200 dark:border-white/10 font-heading font-bold text-sm ${ACCENT_TEXT} hover:underline`}>
              {otherTitle} <FiArrowRight aria-hidden="true" />
            </Link>
          </nav>
          <div className="flex-[999_1_520px] min-w-0 max-w-3xl flex flex-col gap-8">
            {d.sections.map((s, i) => (
              <section key={i} id={`s-${i + 1}`} aria-labelledby={`hs-${i + 1}`} className="scroll-mt-32 flex flex-col gap-3.5 pb-8 border-b border-gray-200 dark:border-white/10">
                <h2 id={`hs-${i + 1}`} className={`flex items-baseline gap-3.5 font-heading font-black text-xl md:text-2xl ${INK}`}>
                  <span aria-hidden="true" className={`pmg-figure ${ACCENT_TEXT}`}>{String(i + 1).padStart(2, '0')}</span>
                  {pick(s, lang)}
                </h2>
                <p className={`px-5 py-4 rounded-xl border border-dashed border-gray-400 dark:border-white/40 text-base leading-relaxed ${BODY}`}>{t.legal.pendingText}</p>
              </section>
            ))}
            <p className={`text-base ${BODY}`}>
              {t.legal.questions}{' '}
              <a href={`mailto:${COMPANY_EMAIL}`} className={`font-heading font-bold ${ACCENT_TEXT} hover:underline`}>{COMPANY_EMAIL}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
