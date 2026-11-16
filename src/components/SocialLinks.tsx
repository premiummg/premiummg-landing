import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { SOCIAL, SOCIAL_PLATFORMS, type SocialPlatform } from '../content/social';

const ICONS: Record<SocialPlatform, typeof FaYoutube> = {
  youtube: FaYoutube, linkedin: FaLinkedinIn, facebook: FaFacebookF, instagram: FaInstagram, x: FaXTwitter,
};

// Icons for the profiles in Site settings. Renders nothing until there is one.
export function SocialLinks({ label, newTab }: { label: string; newTab: string }) {
  if (!SOCIAL.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <p className="pmg-eyebrow text-xs text-white/70">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {SOCIAL.map(({ platform, url }) => {
          const Icon = ICONS[platform];
          return (
            <li key={platform}>
              <a
                href={url} target="_blank" rel="noopener noreferrer" aria-label={`${SOCIAL_PLATFORMS[platform]} (${newTab})`}
                className="w-11 h-11 rounded-full grid place-items-center border border-white/35 text-white hover:bg-(--premium-red) hover:border-(--premium-red) motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Icon size={17} aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
