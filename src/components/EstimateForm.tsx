import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { SiteButton } from '@premiummg/ui';
import { useT } from '../lang';
import { SERVICES } from '../content/services';
import { pick } from '../content/l10n';
import { EMAIL_PATTERN, LIMITS } from '../formLimits';
import { newSubmissionId, postJson, siteConfig, type ApiError } from '../lib/api';
import { Turnstile } from './Turnstile';
import { BODY, INK } from './ui';

const FIELD = 'input-field bg-white dark:bg-(--premium-steel-grey) border-gray-400! dark:border-white/30! text-(--premium-black) dark:text-white';
const LABEL = 'font-heading font-bold text-[13px] text-(--premium-black) dark:text-white';

type Fields = { name: string; company: string; email: string; phone: string; service: string; message: string };
const EMPTY: Fields = { name: '', company: '', email: '', phone: '', service: '', message: '' };

// The estimate request, posted to api/contact.ts (Resend). Shared by the home
// page's closing band and the contact page. Validation runs in the browser
// for a fast answer and again on the server with the same limits
// (src/formLimits.ts), which is the one that counts.
export function EstimateForm({ title, defaultService = '' }: { title?: string; defaultService?: string }) {
  const { t, lang } = useT();
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [fields, setFields] = useState<Fields>({ ...EMPTY, service: defaultService });
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email', string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [turnstileKey, setTurnstileKey] = useState<string | undefined>();
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const submissionId = useRef(newSubmissionId());
  const statusRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    siteConfig().then(c => { if (alive) setTurnstileKey(c.turnstileSiteKey); });
    return () => { alive = false; };
  }, []);

  const set = (k: keyof Fields) => (e: { target: { value: string } }) => setFields(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    const next: typeof errors = {};
    if (!fields.name.trim()) next.name = t.form.errors.name;
    if (!EMAIL_PATTERN.test(fields.email.trim())) next.email = t.form.errors.email;
    setErrors(next);
    setApiError(null);
    if (next.name) { nameRef.current?.focus(); return; }
    if (next.email) { emailRef.current?.focus(); return; }
    if (turnstileKey && !token) { setApiError('captcha'); return; }

    setStatus('sending');
    const result = await postJson('/api/contact', {
      ...fields, lang, submissionId: submissionId.current, turnstileToken: token ?? undefined,
    });
    if (result.ok) {
      setStatus('sent');
      requestAnimationFrame(() => statusRef.current?.focus());
      return;
    }
    setStatus('idle');
    setApiError(result.error === 'invalid' ? 'server' : result.error);
    setToken(null);
    setResetKey(k => k + 1);
  }

  function again() {
    setFields({ ...EMPTY, service: defaultService });
    submissionId.current = newSubmissionId();
    setToken(null);
    setResetKey(k => k + 1);
    setStatus('idle');
  }

  const shell = 'rounded-2xl p-6 sm:p-8 lg:p-10 bg-white dark:bg-(--premium-dark-grey) border border-gray-200 dark:border-white/10 shadow-xl';

  if (status === 'sent') {
    return (
      <div className={shell}>
        <div ref={statusRef} tabIndex={-1} role="status" className="flex flex-col items-start gap-4 py-6 outline-none">
          <span className="w-14 h-14 rounded-lg grid place-items-center bg-(--premium-red-light) dark:bg-(--premium-red)/20">
            <FiCheck size={28} aria-hidden="true" className="text-(--premium-red-dark) dark:text-[#F0797D]" />
          </span>
          <h3 className={`font-heading font-black text-2xl ${INK}`}>{t.form.okTitle}</h3>
          <p className={`text-base leading-relaxed ${BODY}`}>{t.form.okBody}</p>
          <SiteButton variant="ghost" onClick={again}>{t.form.again}</SiteButton>
        </div>
      </div>
    );
  }

  const errorText = apiError ? t.form.errors[apiError === 'invalid' ? 'server' : apiError] : null;

  return (
    <form onSubmit={submit} noValidate aria-labelledby={id('title')} className={`${shell} flex flex-col gap-5`}>
      <div className="flex flex-col gap-1.5">
        <h3 id={id('title')} className={`font-heading font-black text-2xl ${INK}`}>{title ?? t.form.title}</h3>
        <p className={`text-[15px] ${BODY}`}>{t.form.sub}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id('name')} className={LABEL}>
            {t.form.name} <span aria-hidden="true" className="text-(--premium-red-dark) dark:text-[#F0797D]">*</span>
          </label>
          <input
            ref={nameRef} id={id('name')} name="name" autoComplete="name" required maxLength={LIMITS.name}
            value={fields.name} onChange={set('name')}
            aria-invalid={!!errors.name} aria-describedby={errors.name ? id('name-err') : undefined}
            className={FIELD}
          />
          {errors.name && <p id={id('name-err')} className="text-sm text-red-700 dark:text-red-300">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id('company')} className={LABEL}>{t.form.company}</label>
          <input id={id('company')} name="company" autoComplete="organization" maxLength={LIMITS.company} value={fields.company} onChange={set('company')} className={FIELD} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id('email')} className={LABEL}>
            {t.form.email} <span aria-hidden="true" className="text-(--premium-red-dark) dark:text-[#F0797D]">*</span>
          </label>
          <input
            ref={emailRef} id={id('email')} name="email" type="email" autoComplete="email" required maxLength={LIMITS.email}
            value={fields.email} onChange={set('email')}
            aria-invalid={!!errors.email} aria-describedby={errors.email ? id('email-err') : undefined}
            className={FIELD}
          />
          {errors.email && <p id={id('email-err')} className="text-sm text-red-700 dark:text-red-300">{errors.email}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id('phone')} className={LABEL}>{t.form.phone}</label>
          <input id={id('phone')} name="phone" type="tel" autoComplete="tel" maxLength={LIMITS.phone} value={fields.phone} onChange={set('phone')} className={FIELD} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={id('service')} className={LABEL}>{t.form.service}</label>
        <select id={id('service')} name="service" value={fields.service} onChange={set('service')} className={FIELD}>
          <option value="">{t.form.servicePlaceholder}</option>
          {SERVICES.map(s => <option key={s.key} value={s.key}>{pick(s.name, lang)}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={id('message')} className={LABEL}>{t.form.message}</label>
        <textarea
          id={id('message')} name="message" rows={4} maxLength={LIMITS.message}
          placeholder={t.form.messagePlaceholder} value={fields.message} onChange={set('message')}
          className={`${FIELD} resize-y`}
        />
      </div>

      {turnstileKey && <Turnstile siteKey={turnstileKey} lang={lang} onToken={setToken} resetKey={resetKey} />}

      <div aria-live="polite">
        {errorText && <p className="text-sm font-medium text-red-700 dark:text-red-300">{errorText}</p>}
      </div>

      <SiteButton type="submit" disabled={status === 'sending'} className="w-full disabled:opacity-70">
        {status === 'sending' ? t.form.sending : t.form.submit}
        {status !== 'sending' && <FiArrowRight size={16} aria-hidden="true" />}
      </SiteButton>
    </form>
  );
}
