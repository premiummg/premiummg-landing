import { useState } from 'react';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { FiCheck, FiLink } from 'react-icons/fi';
import { shareUrl, type ShareNetwork } from '../lib/share';
import { BODY, INK } from './ui';

const NETWORKS: { key: ShareNetwork; name: string; Icon: typeof FaXTwitter }[] = [
  { key: 'linkedin', name: 'LinkedIn', Icon: FaLinkedinIn },
  { key: 'facebook', name: 'Facebook', Icon: FaFacebookF },
  { key: 'x', name: 'X', Icon: FaXTwitter },
  { key: 'whatsapp', name: 'WhatsApp', Icon: FaWhatsapp },
];

const BTN = `w-11 h-11 rounded-full grid place-items-center border border-gray-300 dark:border-white/25 ${INK} hover:border-(--premium-red) hover:text-(--premium-red) motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--premium-red)`;

// Share links are plain addresses (no network script is loaded), plus a copy
// button for everywhere else.
export function ShareButtons({ url, title, label, copyLabel, copiedLabel, newTab }: {
  url: string; title: string; label: string; copyLabel: string; copiedLabel: string; newTab: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard blocked: the link buttons above still work */ }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`pmg-eyebrow text-xs ${BODY}`}>{label}</span>
      <ul className="flex items-center gap-2">
        {NETWORKS.map(({ key, name, Icon }) => (
          <li key={key}>
            <a href={shareUrl(key, url, title)} target="_blank" rel="noopener noreferrer" aria-label={`${name} (${newTab})`} className={BTN}>
              <Icon size={17} aria-hidden="true" />
            </a>
          </li>
        ))}
        <li>
          <button type="button" onClick={copy} aria-label={copyLabel} className={BTN}>
            {copied ? <FiCheck size={17} aria-hidden="true" /> : <FiLink size={17} aria-hidden="true" />}
          </button>
        </li>
      </ul>
      <span role="status" className={`text-sm ${BODY}`}>{copied ? copiedLabel : ''}</span>
    </div>
  );
}
