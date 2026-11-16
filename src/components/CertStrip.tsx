import { useT } from '../lang';
import { Certifications } from './Certifications';
import { BAND_PANEL, CONTAINER, INK } from './ui';

// A slim band of the four marks under an inner page's hero.
export function CertStrip() {
  const { t } = useT();
  return (
    <section aria-label={t.footer.certified} className={`${BAND_PANEL} border-b border-gray-200 dark:border-white/10`}>
      <div className={`${CONTAINER} py-7 flex flex-wrap items-center justify-between gap-x-8 gap-y-4`}>
        <div className="flex flex-col gap-1.5">
          <p className="pmg-eyebrow text-xs text-(--premium-red-dark) dark:text-[#F0797D]">{t.footer.certified}</p>
          <p className={`font-heading font-extrabold text-lg ${INK}`}>{t.credentials.strip}</p>
        </div>
        <Certifications bordered />
      </div>
    </section>
  );
}
