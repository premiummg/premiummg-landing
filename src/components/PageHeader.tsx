import type { ReactNode } from 'react';
import { ColorField, Eyebrow } from '@premiummg/ui';
import { CONTAINER } from './ui';

// The opening band of an inner page (projects, blog, contact, legal): the
// brand's bold red field (SECONDARY red with the 45deg bars, pg. 16), an
// eyebrow and the page's one h1.
export function PageHeader({ eyebrow, title, sub, children }: {
  eyebrow: string;
  title: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <ColorField>
      <div className={`${CONTAINER} py-14 md:py-20 flex flex-col gap-5`}>
        <Eyebrow text={eyebrow} tone="onColor" className="text-xs text-white!" />
        <h1 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white max-w-4xl text-balance">
          {title}
        </h1>
        {sub && <p className="text-lg leading-relaxed text-white/90 max-w-2xl">{sub}</p>}
        {children}
      </div>
    </ColorField>
  );
}
