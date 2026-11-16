import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../lang';
import { useLocaleHref } from '../lib/useLocaleHref';

// Home / ... / current page. For a red or photo band: white text.
export function Breadcrumb({ trail }: { trail: { label: string; path?: string }[] }) {
  const { t } = useT();
  const href = useLocaleHref();
  const all = [{ label: t.breadcrumb.home, path: '/' }, ...trail];
  return (
    <nav aria-label={t.breadcrumb.label}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-white/90">
        {all.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <li aria-hidden="true">/</li>}
            <li>
              {c.path && i < all.length - 1 ? (
                <Link to={href(c.path)} className="inline-flex items-center min-h-7 text-white hover:underline">{c.label}</Link>
              ) : (
                <span aria-current="page">{c.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
