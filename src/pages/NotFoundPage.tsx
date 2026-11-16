import { FiArrowRight } from 'react-icons/fi';
import { SiteButton } from '@premiummg/ui';
import { useT } from '../lang';
import { useLinkProps } from '../lib/useLocaleHref';
import { PageHeader } from '../components/PageHeader';
import { BAND_PANEL, CONTAINER } from '../components/ui';

export function NotFoundPage() {
  const { t } = useT();
  const link = useLinkProps();
  return (
    <>
      <PageHeader eyebrow={t.notFound.eyebrow} title={t.notFound.title} sub={t.notFound.sub} />
      <div className={BAND_PANEL}>
        <div className={`${CONTAINER} py-16`}>
          <SiteButton {...link('/')}>{t.notFound.cta} <FiArrowRight size={16} aria-hidden="true" /></SiteButton>
        </div>
      </div>
    </>
  );
}
