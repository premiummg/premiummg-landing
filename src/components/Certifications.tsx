import { CredentialBadges, type CredentialBadgesSize } from '@premiummg/ui';
import { useT } from '../lang';
import { CERTS, media } from '../content/media';

// The four marks Premium is proudest of (UL, FCIA, COR, NFCA), wired to
// @premiummg/ui's CredentialBadges with their names in the visitor's
// language. Used in the hero, the credentials band, the contact block, every
// service page and the footer, so they are never more than a scroll away.
export function Certifications({ size = 'md', bordered = false, className = '' }: {
  size?: CredentialBadgesSize; bordered?: boolean; className?: string;
}) {
  const { t } = useT();
  return (
    <CredentialBadges
      size={size}
      bordered={bordered}
      className={className}
      items={CERTS.map(c => ({ src: media(c.file), name: t.certs[c.key].name, href: c.href }))}
    />
  );
}
