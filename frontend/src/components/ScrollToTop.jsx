import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to top on route or query change (e.g. /search?sort=newest) */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
