import { useCallback, useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { COPY, type Lang } from './copy';
import { LangCtx } from './lang';
import { useDarkMode } from './lib/useDarkMode';
import { FR_PREFIX, localePath, splitLocalePath } from './lib/routes';
import { Seo } from './components/Seo';
import { SiteHeader } from './components/SiteHeader';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicePage } from './pages/ServicePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BlogPage } from './pages/BlogPage';
import { ArticlePage } from './pages/ArticlePage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Where each history entry's scroll position was last seen, keyed by React
// Router's per-entry `location.key`, so Back returns the reader to where they
// were instead of the top of the page.
const scrollPositions = new Map<string, number>();

// A route change scrolls to the top (or to the #section in the URL); Back and
// Forward restore the last position. Switching language is a navigation too
// (`/about` to `/fr/about`) but the same page, so it leaves the scroll alone.
function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const { path } = splitLocalePath(pathname);
  const lastPath = useRef(path);

  useEffect(() => {
    const original = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = original; };
  }, []);

  useEffect(() => {
    const onScroll = () => scrollPositions.set(key, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [key]);

  useEffect(() => {
    const changedPage = lastPath.current !== path;
    lastPath.current = path;
    if (navigationType === 'POP') {
      if (changedPage) window.scrollTo(0, scrollPositions.get(key) ?? 0);
      return;
    }
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      return;
    }
    if (changedPage) window.scrollTo(0, 0);
  }, [path, hash, key, navigationType]);

  return null;
}

// Language comes from the URL, not from state or localStorage: each language
// is its own indexable URL tree, so the choice survives a reload, a shared
// link and the Back button for free.
export function AppRoutes() {
  const { isDark, toggle } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, path } = splitLocalePath(location.pathname);
  const t = COPY[lang];

  const setLang = useCallback(
    (next: Lang) => navigate(`${localePath(next, path)}${location.hash}`),
    [navigate, path, location.hash],
  );

  const pages = (
    <>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services/:key" element={<ServicePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<ArticlePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<LegalPage doc="terms" />} />
      <Route path="/privacy" element={<LegalPage doc="privacy" />} />
    </>
  );

  return (
    <LangCtx.Provider value={{ t, lang }}>
      <Seo lang={lang} path={path} />
      <ScrollManager />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-3 focus:rounded-lg focus:bg-white focus:text-black focus:font-heading focus:font-bold">
        {t.skipToContent}
      </a>
      <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-(--premium-black)">
        <SiteHeader lang={lang} setLang={setLang} isDark={isDark} toggleTheme={toggle} />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <Routes>
              {pages}
              <Route path={FR_PREFIX}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="services/:key" element={<ServicePage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:slug" element={<ArticlePage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="terms" element={<LegalPage doc="terms" />} />
                <Route path="privacy" element={<LegalPage doc="privacy" />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </LangCtx.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
