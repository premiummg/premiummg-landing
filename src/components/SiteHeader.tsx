import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronDown, FiClock, FiMapPin, FiMenu, FiPhone, FiX } from 'react-icons/fi';
import { DarkModeToggle, LanguageToggle, SiteButton, useOutsideClick } from '@premiummg/ui';
import type { Lang } from '../copy';
import { useT } from '../lang';
import { SERVICES } from '../content/services';
import { pick } from '../content/l10n';
import { SERVICE_PATH, splitLocalePath } from '../lib/routes';
import { useLinkProps, useLocaleHref } from '../lib/useLocaleHref';
import { PHONE_DISPLAY, PHONE_E164 } from '../site';
import { Logo } from './Logo';
import { CONTAINER } from './ui';

export interface HeaderProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

type NavKey = 'home' | 'about' | 'services' | 'projects' | 'blog' | 'contact';

// Which top-level item the current page belongs to, for aria-current and
// the amber underline.
function activeKey(path: string): NavKey | null {
  if (path === '/') return 'home';
  if (path === '/about') return 'about';
  if (path.startsWith('/services/')) return 'services';
  if (path === '/projects') return 'projects';
  if (path === '/blog' || path.startsWith('/blog/')) return 'blog';
  if (path === '/contact') return 'contact';
  return null;
}

const LINK = 'relative inline-flex items-center gap-1.5 min-h-11 text-[15px] font-medium whitespace-nowrap text-gray-700 dark:text-gray-300 hover:text-(--premium-black) dark:hover:text-white transition-colors after:absolute after:left-0 after:bottom-1 after:h-0.75 after:w-0 after:bg-(--premium-orange) after:transition-all after:duration-200 hover:after:w-full';
const LINK_ON = 'text-(--premium-black)! dark:text-white! font-semibold after:w-full!';

// The public site's header: a black utility strip (service area, hours,
// phone) over the white nav, closed by the hi-vis amber stripe from the
// brand book's reference site (pg. 22). Not @premiummg/ui's Navbar, which is
// app chrome with no link row; the toggles and the CTA inside ARE shared.
export function SiteHeader({ lang, setLang, isDark, toggleTheme }: HeaderProps) {
  const { t } = useT();
  const href = useLocaleHref();
  const link = useLinkProps();
  const { pathname } = useLocation();
  const active = activeKey(splitLocalePath(pathname).path);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const servicesId = useId();

  useOutsideClick(servicesRef, () => setServicesOpen(false), servicesOpen);

  // Any navigation closes both menus.
  useEffect(() => {
    setServicesOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!servicesOpen && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setServicesOpen(false); setMenuOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [servicesOpen, menuOpen]);

  const items: { key: NavKey; label: string; path: string }[] = [
    { key: 'home', label: t.nav.home, path: '/' },
    { key: 'about', label: t.nav.about, path: '/about' },
    { key: 'projects', label: t.nav.projects, path: '/projects' },
    { key: 'blog', label: t.nav.blog, path: '/blog' },
    { key: 'contact', label: t.nav.contact, path: '/contact' },
  ];
  const navLink = (item: (typeof items)[number]) => (
    <Link
      key={item.key}
      to={href(item.path)}
      aria-current={active === item.key ? 'page' : undefined}
      className={`${LINK} ${active === item.key ? LINK_ON : ''}`}
    >
      {item.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-(--premium-black) text-white/80 text-[13px]">
        <div className={`${CONTAINER} min-h-10 py-1.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1`}>
          <p className="hidden md:inline-flex items-center gap-2">
            <FiMapPin size={14} className="text-(--premium-orange)" aria-hidden="true" /> {t.area}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 ml-auto">
            <p className="hidden sm:inline-flex items-center gap-2">
              <FiClock size={14} className="text-(--premium-orange)" aria-hidden="true" /> {t.hours}
            </p>
            <a href={`tel:${PHONE_E164}`} className="inline-flex items-center gap-2 min-h-7 font-heading font-bold text-white hover:underline">
              <FiPhone size={14} className="text-(--premium-orange)" aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-(--premium-dark-grey)">
        <div className={`${CONTAINER} max-sm:px-4 min-h-19 flex items-center justify-between gap-3`}>
          <Link to={href('/')} aria-label={`Premium Group, ${t.nav.home}`} className="shrink-0">
            <Logo lang={lang} surface="theme" className="h-8 sm:h-10" />
          </Link>

          {/* No "Home" item on desktop: the logo is the way home, and French
              labels are long enough that every pixel of this row counts. */}
          <nav aria-label={t.nav.primary} className="hidden xl:flex items-center gap-6">
            {navLink(items[1])}
            <div ref={servicesRef} className="relative">
              <button
                type="button"
                aria-expanded={servicesOpen}
                aria-controls={servicesId}
                onClick={() => setServicesOpen(o => !o)}
                className={`${LINK} ${active === 'services' ? LINK_ON : ''}`}
              >
                {t.nav.services}
                <FiChevronDown size={14} aria-hidden="true" className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <ul id={servicesId} className="absolute -left-4 top-full mt-2 w-64 py-2 rounded-xl bg-white dark:bg-(--premium-steel-grey) border border-gray-200 dark:border-white/10 shadow-lg">
                  {SERVICES.map(s => (
                    <li key={s.key}>
                      <Link
                        to={href(SERVICE_PATH(s.key))}
                        aria-current={pathname === href(SERVICE_PATH(s.key)) ? 'page' : undefined}
                        className="flex items-center min-h-11 px-4 text-[15px] text-(--premium-black) dark:text-white hover:bg-(--premium-light-grey) dark:hover:bg-white/10"
                      >
                        {pick(s.name, lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {items.slice(2).map(navLink)}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle lang={lang} onChange={setLang} names={{ en: 'English', fr: 'Français' }} />
            {/* On a phone the theme switch moves into the menu: logo, language
                and menu button already fill a 390px row. */}
            <DarkModeToggle isDark={isDark} onToggle={toggleTheme} size={18} ariaLabel={t.nav.darkMode} className="hidden! sm:grid! w-11 h-11 place-items-center" />
            <SiteButton {...link('/contact')} className="hidden! md:inline-flex! px-4! py-2.5! whitespace-nowrap">
              {t.nav.cta}
            </SiteButton>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? t.nav.close : t.nav.menu}
              onClick={() => setMenuOpen(o => !o)}
              className="xl:hidden w-11 h-11 grid place-items-center rounded-lg border border-gray-300 dark:border-white/25 text-(--premium-black) dark:text-white"
            >
              {menuOpen ? <FiX size={20} aria-hidden="true" /> : <FiMenu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id={menuId} aria-label={t.nav.primary} className="xl:hidden border-t border-gray-200 dark:border-white/10 max-h-[70vh] overflow-y-auto">
            <ul className={`${CONTAINER} py-3`}>
              {[items[0], items[1]].map(item => (
                <li key={item.key}>
                  <Link to={href(item.path)} aria-current={active === item.key ? 'page' : undefined} className="flex items-center min-h-12 text-base font-medium text-(--premium-black) dark:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <p className="pmg-eyebrow text-gray-600 dark:text-gray-300 py-2">{t.nav.services}</p>
                <ul>
                  {SERVICES.map(s => (
                    <li key={s.key}>
                      <Link to={href(SERVICE_PATH(s.key))} className="flex items-center min-h-11 pl-4 text-[15px] text-(--premium-black) dark:text-white">
                        {pick(s.name, lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              {items.slice(2).map(item => (
                <li key={item.key}>
                  <Link to={href(item.path)} aria-current={active === item.key ? 'page' : undefined} className="flex items-center min-h-12 text-base font-medium text-(--premium-black) dark:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="sm:hidden flex items-center justify-between gap-4 min-h-12 mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                <span className={`text-base font-medium text-(--premium-black) dark:text-white`}>{t.nav.darkMode}</span>
                <DarkModeToggle isDark={isDark} onToggle={toggleTheme} size={18} ariaLabel={t.nav.darkMode} className="w-11 h-11 grid place-items-center" />
              </li>
              <li className="pt-3 md:hidden">
                <SiteButton {...link('/contact')} className="w-full">{t.nav.cta}</SiteButton>
              </li>
            </ul>
          </nav>
        )}
      </div>
      <div className="pmg-stripe h-0.75" />
    </header>
  );
}
