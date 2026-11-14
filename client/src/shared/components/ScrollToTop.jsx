import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically resets scroll position to the top of the page whenever
 * the route (pathname/search) changes.
 * 
 * Prevents mobile and desktop browsers from preserving the prior scroll position
 * (e.g. opening a new page scrolled down at the footer when clicking footer or mobile links).
 * Also gracefully supports anchor hashes (e.g. /#timeline).
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Disable browser's automatic scroll restoration to avoid jumping to old scroll offsets
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (hash) {
      // Delay slightly to let the target element mount in the DOM
      const targetId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo(0, 0);
          if (document.documentElement) document.documentElement.scrollTop = 0;
          if (document.body) document.body.scrollTop = 0;
        }
      }, 50);

      return () => clearTimeout(timer);
    }

    // Immediately reset scroll position to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Double-check on next animation frame in case mobile browser tried to restore scroll
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
