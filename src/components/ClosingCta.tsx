import { FiArrowRight } from 'react-icons/fi';
import { ColorField, Eyebrow, SiteButton } from '@premiummg/ui';
import { useT } from '../lang';
import { useLinkProps } from '../lib/useLocaleHref';
import { PHONE_DISPLAY, PHONE_E164 } from '../site';
import { CONTAINER } from './ui';

// The closing call to action of every inner page.
export function ClosingCta() {
  const { t } = useT();
  const link = useLinkProps();
  return (
    <section aria-labelledby="h-closing">
      <ColorField>
        <div className={`${CONTAINER} py-16 md:py-18 flex flex-wrap items-center justify-between gap-8`}>
          <div className="flex-1 basis-[28rem] flex flex-col gap-3.5">
            <Eyebrow text={t.estimate.eyebrow} tone="onColor" className="text-xs text-white!" />
            <h2 id="h-closing" className="font-heading font-black text-3xl md:text-4xl leading-[1.1] text-balance">{t.estimate.title}</h2>
            <p className="text-[17px] leading-relaxed text-white/90 max-w-2xl">{t.contactPage.infoSub}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SiteButton variant="onRed" {...link('/contact')}>{t.nav.cta} <FiArrowRight size={16} aria-hidden="true" /></SiteButton>
            <SiteButton variant="onDark" href={`tel:${PHONE_E164}`}>{PHONE_DISPLAY}</SiteButton>
          </div>
        </div>
      </ColorField>
    </section>
  );
}
