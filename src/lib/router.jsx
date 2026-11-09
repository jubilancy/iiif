import { useEffect, useState, useCallback } from 'react';

// Tiny history-API router: no dependencies, works with Cloudflare Pages' SPA fallback.
export function useLocation() {
  const [loc, setLoc] = useState({ path: window.location.pathname, search: window.location.search });
  useEffect(() => {
    const onPop = () => setLoc({ path: window.location.pathname, search: window.location.search });
    window.addEventListener('popstate', onPop);
    window.addEventListener('app:navigate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('app:navigate', onPop);
    };
  }, []);
  return loc;
}

export function navigate(to) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new Event('app:navigate'));
  window.scrollTo(0, 0);
}

export function Link({ to, children, ...rest }) {
  const onClick = useCallback((e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(to);
  }, [to]);
  return <a href={to} onClick={onClick} {...rest}>{children}</a>;
}

export function viewerUrl(manifests, extra = '') {
  const q = manifests.map((m) => `manifest=${encodeURIComponent(m)}`).join('&');
  return `/viewer${q ? `?${q}` : ''}${extra}`;
}
