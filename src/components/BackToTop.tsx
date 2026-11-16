import { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { useT } from '../lang';

// A corner button once the visitor is a screen and a half down a long page.
export function BackToTop() {
  const { t } = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 1.5);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
      aria-label={t.backToTop}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={`fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full grid place-items-center text-white bg-(--premium-red) hover:bg-(--premium-red-dark) shadow-lg motion-safe:transition-all motion-safe:duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <FiArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
