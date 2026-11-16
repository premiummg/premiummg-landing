import type { ReactNode } from 'react';
import { FiCheckCircle, FiClock, FiMail, FiMapPin, FiNavigation, FiPhone } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { QuoteCard } from '@premiummg/ui';
import { useT } from '../lang';
import { ADDRESS, COMPANY_EMAIL, PHONE_DISPLAY, PHONE_E164 } from '../site';
import { CertStrip } from '../components/CertStrip';
import { EstimateForm } from '../components/EstimateForm';
import { PageHeader } from '../components/PageHeader';
import { Section, SectionHeading } from '../components/Section';
import { ACCENT_TEXT, BODY, CARD_ON_GROUND, INK } from '../components/ui';

const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${ADDRESS.streetAddress}, ${ADDRESS.addressLocality}, ${ADDRESS.addressRegion} ${ADDRESS.postalCode}`,
)}`;

function Info({ icon: Icon, label, children }: { icon: IconType; label: string; children: ReactNode }) {
  return (
    <li className={`flex items-start gap-4 p-5 rounded-xl ${CARD_ON_GROUND}`}>
      <span className="w-11 h-11 shrink-0 rounded-lg grid place-items-center bg-(--premium-red-light) dark:bg-(--premium-red)/20">
        <Icon size={20} aria-hidden="true" className={ACCENT_TEXT} />
      </span>
      <span className="flex flex-col gap-1 min-w-0">
        <span className={`pmg-eyebrow text-xs ${BODY}`}>{label}</span>
        {children}
      </span>
    </li>
  );
}

export function ContactPage() {
  const { t } = useT();
  const c = t.contactPage;
  const big = `inline-flex items-center min-h-8 font-heading font-extrabold text-lg break-all ${INK} hover:underline`;

  return (
    <>
      <PageHeader crumb={[{ label: t.nav.contact }]} eyebrow={c.eyebrow} title={c.title} sub={c.sub} />

      <Section tone="ground" labelledBy="h-info">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16 items-start">
          <div className="flex flex-col gap-7">
            <SectionHeading id="h-info" eyebrow={c.infoEyebrow} title={c.infoTitle} sub={c.infoSub} />
            <ul className="flex flex-col gap-3">
              <Info icon={FiPhone} label={c.phone}><a href={`tel:${PHONE_E164}`} className={`${big} tabular-nums`}>{PHONE_DISPLAY}</a></Info>
              <Info icon={FiMail} label={c.email}><a href={`mailto:${COMPANY_EMAIL}`} className={big}>{COMPANY_EMAIL}</a></Info>
              <Info icon={FiMapPin} label={c.address}>
                <span className={`text-base ${INK}`}>{t.address}</span>
                <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 min-h-8 text-sm font-heading font-bold ${ACCENT_TEXT} hover:underline`}>
                  <FiNavigation size={14} aria-hidden="true" /> {c.directions}
                </a>
              </Info>
              <Info icon={FiClock} label={t.footer.hours}><span className={`text-base ${INK}`}>{t.hours}</span></Info>
              <Info icon={FiCheckCircle} label={t.footer.serviceArea}><span className={`text-base ${INK}`}>{t.area}</span></Info>
            </ul>
          </div>
          <EstimateForm title={c.formTitle} />
        </div>
      </Section>

      <CertStrip />

      <Section tone="ground" labelledBy="h-reviews">
        <SectionHeading id="h-reviews" eyebrow={t.reviews.eyebrow} title={t.reviews.title} />
        <div className="grid gap-6 mt-11 md:grid-cols-2">
          {t.reviews.items.map(r => (
            <QuoteCard key={r.name} quote={r.quote} name={<>{r.name} <span className="font-normal">· {t.reviews.client}</span></>} />
          ))}
        </div>
      </Section>
    </>
  );
}
