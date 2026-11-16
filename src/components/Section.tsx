import type { ReactNode } from 'react';
import { Eyebrow } from '@premiummg/ui';
import { BAND_GROUND, BAND_PANEL, BODY, CONTAINER, INK, SECTION_PAD } from './ui';

export function Section({ id, tone = 'panel', labelledBy, className = '', children }: {
  id?: string;
  tone?: 'panel' | 'ground';
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`${tone === 'panel' ? BAND_PANEL : BAND_GROUND} ${className}`}>
      <div className={`${CONTAINER} ${SECTION_PAD}`}>{children}</div>
    </section>
  );
}

// The page's own section heading, not @premiummg/ui's SectionHead: that one
// renders its eyebrow in MAIN red at 10px, which fails contrast on the light
// grey band, and gives the h2 no id for aria-labelledby.
export function SectionHeading({ id, eyebrow, title, sub, tone = 'light', className = '' }: {
  id: string;
  eyebrow: string;
  title: string;
  sub?: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <div className={`max-w-3xl flex flex-col gap-3.5 ${className}`}>
      <Eyebrow text={eyebrow} tone={dark ? 'amber' : 'red'} className={dark ? 'text-xs' : 'text-xs text-(--premium-red-dark)! dark:text-[#F0797D]!'} />
      <h2 id={id} className={`font-heading font-black text-3xl md:text-4xl leading-[1.1] text-balance ${dark ? 'text-white' : INK}`}>
        {title}
      </h2>
      {sub && <p className={`text-base md:text-lg leading-relaxed ${dark ? 'text-white/80' : BODY}`}>{sub}</p>}
    </div>
  );
}
