import { useEffect, useState } from 'react';
import { Link, useLocation } from './lib/router.jsx';
import { useCollage } from './lib/useCollage.js';
import Viewer from './pages/Viewer.jsx';
import Gallery from './pages/Gallery.jsx';
import Search from './pages/Search.jsx';
import Collage from './pages/Collage.jsx';

function readTheme() {
  try {
    const t = window.localStorage.getItem('iiif.theme');
    if (t === 'light' || t === 'dark') return t;
  } catch { /* storage unavailable */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const { path, search } = useLocation();
  const [theme, setTheme] = useState(readTheme);
  const collage = useCollage();
  const sp = new URLSearchParams(search);
  const manifests = sp.getAll('manifest').filter(Boolean);
  const list = (k) => (sp.get(k) || '').split(',').map((x) => x.trim()).filter(Boolean);
  const disable = list('disable');
  const enable = list('enable');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem('iiif.theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const embed = path === '/embed';
  const isViewer = path === '/viewer' || embed || (path === '/' && manifests.length > 0);

  if (embed) return <Viewer manifests={manifests} theme={theme} embed disable={disable} enable={enable} />;

  let page;
  if (isViewer) page = <Viewer manifests={manifests} theme={theme} disable={disable} enable={enable} />;
  else if (path === '/search') page = <Search />;
  else if (path === '/collage') page = <Collage />;
  else page = <Gallery />;

  const navCls = (p) => (path === p || (p === '/' && !isViewer && !['/search', '/collage'].includes(path)) ? 'active' : '');

  return (
    <div className={`app ${isViewer ? 'is-viewer' : ''}`}>
      <header className="topbar">
        <Link to="/" className="brand">iiif.glosse.me</Link>
        <nav aria-label="Main">
          <Link to="/" className={navCls('/')}>Gallery</Link>
          <Link to="/search" className={navCls('/search')}>Search</Link>
          <Link to="/collage" className={navCls('/collage')}>Collage{collage.length ? ` (${collage.length})` : ''}</Link>
          <Link to="/viewer" className={navCls('/viewer')}>Viewer</Link>
        </nav>
        <button className="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button>
      </header>
      <main>{page}</main>
      {!isViewer && (
        <footer className="foot muted small">
          Built on <a href="https://projectmirador.org" target="_blank" rel="noreferrer">Mirador</a>. Source on <a href="https://github.com/jubilancy/iiif" target="_blank" rel="noreferrer">GitHub</a> (MIT).
        </footer>
      )}
    </div>
  );
}
