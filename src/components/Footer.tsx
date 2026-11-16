import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiMail, FiPhone } from 'react-icons/fi';
import { FooterColumn, SiteFooter } from '@premiummg/ui';
import { useT } from '../lang';
import { SERVICES } from '../content/services';
import { pick } from '../content/l10n';
import { SERVICE_PATH } from '../lib/routes';
import { useLocaleHref } from '../lib/useLocaleHref';
import { newSubmissionId, postJson } from '../lib/api';
import { EMAIL_PATTERN, LIMITS } from '../formLimits';
import { COMPANY_EMAIL, LEGAL_NAME, PHONE_DISPLAY, PHONE_E164 } from '../site';
import { Certifications } from './Certifications';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';

const FL = 'inline-flex items-center gap-2 min-h-8 text-[15px] text-white/80 hover:text-white hover:underline';

function Newsletter() {
  const { t, lang } = useT();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) { setState('error'); return; }
    setState('sending');
    const res = await postJson('/api/subscribe', { email, lang, submissionId: newSubmissionId() });
    setState(res.ok ? 'ok' : 'error');
  }

  if (state === 'ok') {
    return <p role="status" className="inline-flex items-center gap-2 text-[15px] text-(--premium-orange)"><FiCheck aria-hidden="true" /> {t.newsletter.ok}</p>;
  }
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-2.5">
      <label htmlFor="newsletter-email" className="text-[15px] leading-relaxed">{t.newsletter.body}</label>
      <div className="flex flex-wrap gap-2">
        <input
          id="newsletter-email" type="email" autoComplete="email" maxLength={LIMITS.email}
          placeholder={t.newsletter.placeholder} value={email} onChange={e => setEmail(e.target.value)}
          aria-invalid={state === 'error'} aria-describedby={state === 'error' ? 'newsletter-err' : undefined}
          className="flex-1 basis-36 min-w-0 min-h-11 rounded-lg px-3 bg-(--premium-dark-grey) border border-white/45 text-base text-white placeholder:text-white/60 focus:border-white"
        />
        <button
          type="submit" disabled={state === 'sending'}
          className="min-h-11 px-4 rounded-lg font-heading font-bold text-sm text-white bg-(--premium-red) hover:bg-(--premium-red-dark) disabled:opacity-70"
        >
          {t.newsletter.cta}
        </button>
      </div>
      <div aria-live="polite">{state === 'error' && <p id="newsletter-err" className="text-sm text-red-300">{t.newsletter.error}</p>}</div>
    </form>
  );
}

export function Footer() {
  const { t, lang } = useT();
  const href = useLocaleHref();

  return (
    <SiteFooter
      columns={5}
      className="text-white/80!"
      top={
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <p className="pmg-eyebrow text-xs text-(--premium-orange)">{t.footer.certified}</p>
            <p className="font-heading font-extrabold text-lg text-white">{t.credentials.strip}</p>
          </div>
          <Certifications size="md" />
        </div>
      }
      copyright={<span className="text-white/70">© {new Date().getFullYear()} {LEGAL_NAME} {t.footer.rights}</span>}
      legalLinks={
        <>
          <Link to={href('/terms')} className="inline-flex items-center min-h-7 text-white/70 hover:text-white hover:underline">{t.footer.terms}</Link>
          <Link to={href('/privacy')} className="inline-flex items-center min-h-7 text-white/70 hover:text-white hover:underline">{t.footer.privacy}</Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Logo lang={lang} surface="dark" className="h-11 self-start" />
        <p className="text-[15px] leading-relaxed">{t.address}</p>
        <p className="pmg-eyebrow text-xs text-white/70">{t.footer.serviceArea}</p>
        <p className="text-[15px] leading-relaxed -mt-2">{t.area}</p>
      </div>
      <FooterColumn label={t.footer.services}>
        <ul className="flex flex-col gap-1">
          {SERVICES.map(s => (
            <li key={s.key}><Link to={href(SERVICE_PATH(s.key))} className={FL}>{pick(s.name, lang)}</Link></li>
          ))}
        </ul>
      </FooterColumn>
      <FooterColumn label={t.footer.company}>
        <ul className="flex flex-col gap-1">
          <li><Link to={href('/about')} className={FL}>{t.nav.about}</Link></li>
          <li><Link to={href('/projects')} className={FL}>{t.nav.projects}</Link></li>
          <li><Link to={href('/blog')} className={FL}>{t.nav.blog}</Link></li>
          <li><Link to={href('/contact')} className={FL}>{t.nav.contact}</Link></li>
        </ul>
      </FooterColumn>
      <FooterColumn label={t.footer.contact}>
        <ul className="flex flex-col gap-1">
          <li><a href={`tel:${PHONE_E164}`} className={FL}><FiPhone size={15} aria-hidden="true" /> {PHONE_DISPLAY}</a></li>
          <li><a href={`mailto:${COMPANY_EMAIL}`} className={FL}><FiMail size={15} aria-hidden="true" /> {COMPANY_EMAIL}</a></li>
        </ul>
        <p className="pmg-eyebrow text-xs text-white/70 mt-6 mb-2">{t.footer.hours}</p>
        <p className="text-[15px]">{t.hours}</p>
        <div className="mt-6"><SocialLinks label={t.footer.follow} newTab={t.articlePage.newTab} /></div>
      </FooterColumn>
      <FooterColumn label={t.newsletter.label}>
        <Newsletter />
      </FooterColumn>
    </SiteFooter>
  );
}
