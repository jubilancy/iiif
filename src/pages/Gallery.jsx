import { useEffect, useMemo, useState } from 'react';
import { parseCsvObjects } from '../lib/csv.js';
import { fetchManifestSummary, mapLimit } from '../lib/manifest.js';
import { addToCollage } from '../lib/collageStore.js';
import { navigate, viewerUrl, Link } from '../lib/router.jsx';

export default function Gallery() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [collection, setCollection] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let live = true;
    fetch('/gallery.csv')
      .then((r) => { if (!r.ok) throw new Error(`gallery.csv: HTTP ${r.status}`); return r.text(); })
      .then(async (t) => {
        const base = parseCsvObjects(t).filter((r) => /^https?:\/\//i.test(r.manifest_url));
        if (!live) return;
        setRows(base.map((r) => ({ ...r, state: r.title && r.thumbnail ? 'ready' : 'loading' })));
        // Fill missing title/thumbnail from the manifest itself; a bad manifest never breaks the rest.
        await mapLimit(base.map((r, i) => [r, i]).filter(([r]) => !(r.title && r.thumbnail)), 4, async ([r, i]) => {
          try {
            const s = await fetchManifestSummary(r.manifest_url);
            if (live) setRows((cur) => cur.map((x, j) => (j === i ? { ...x, title: x.title || s.title, thumbnail: x.thumbnail || s.thumbnail, state: 'ready' } : x)));
          } catch {
            if (live) setRows((cur) => cur.map((x, j) => (j === i ? { ...x, state: 'error' } : x)));
          }
        });
      })
      .catch((e) => live && setError(String(e.message || e)));
    return () => { live = false; };
  }, []);

  const collections = useMemo(() => [...new Set((rows || []).map((r) => r.collection).filter(Boolean))].sort(), [rows]);
  const shown = (rows || []).filter((r) => (!collection || r.collection === collection)
    && (!q || `${r.title} ${r.collection} ${r.notes}`.toLowerCase().includes(q.toLowerCase())));

  function add(r) {
    const n = addToCollage([{ url: r.manifest_url, title: r.title || r.manifest_url, thumbnail: r.thumbnail }]);
    setNotice(n ? `Added “${r.title}” to your collage.` : 'Already in your collage.');
  }

  return (
    <section className="page">
      <h1>Gallery</h1>
      <p className="muted">
        No manifest list? Browse these IIIF items, open one in the viewer, or add several to a <Link to="/collage">collage</Link>.
        You can also <Link to="/search">search museums and libraries</Link>.
      </p>
      <div className="row">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter gallery…" aria-label="Filter gallery" />
        <select value={collection} onChange={(e) => setCollection(e.target.value)} aria-label="Collection">
          <option value="">All collections</option>
          {collections.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {notice && <p role="status" className="status">{notice}</p>}
      {error && <p className="error">Could not load the gallery: {error}</p>}
      {!rows && !error && <p className="muted">Loading…</p>}
      <ul className="grid">
        {shown.map((r) => (
          <li key={r.manifest_url} className="card">
            {r.thumbnail ? <img src={r.thumbnail} alt="" loading="lazy" /> : <div className="noimg">{r.state === 'error' ? 'Unavailable' : '…'}</div>}
            <div className="card-body">
              <strong title={r.title}>{r.title || r.manifest_url}</strong>
              {r.collection && <span className="muted small">{r.collection}</span>}
              <div className="row small">
                <button onClick={() => navigate(viewerUrl([r.manifest_url]))}>Open</button>
                <button className="ghost" onClick={() => add(r)}>Add to collage</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {rows && !shown.length && <p className="muted">Nothing matches.</p>}
    </section>
  );
}
