import { useCallback, useEffect, useRef, useState } from 'react';
import { providers, providerById } from '../providers/index.js';
import { addToCollage } from '../lib/collageStore.js';
import { navigate, viewerUrl } from '../lib/router.jsx';

function interleave(lists) {
  const out = [];
  const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i += 1) lists.forEach((l) => l[i] && out.push(l[i]));
  return out;
}

export default function Search() {
  const params = new URLSearchParams(window.location.search);
  const [q, setQ] = useState(params.get('q') || '');
  const [source, setSource] = useState(params.get('source') || 'artic');
  const [publicOnly, setPublicOnly] = useState(params.get('public') !== '0');
  const [page, setPage] = useState(Number(params.get('page')) || 1);
  const [state, setState] = useState({ loading: false, items: [], totalPages: 1, total: 0, errors: [] });
  const [notice, setNotice] = useState('');
  const abort = useRef(null);

  const run = useCallback(async (query, src, pub, pg) => {
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    setState((s) => ({ ...s, loading: true, errors: [] }));
    const targets = src === 'all' ? providers : [providerById[src]];
    const settled = await Promise.allSettled(targets.map((p) => p.search({ q: query, page: pg, publicOnly: pub, signal: ctl.signal })));
    if (ctl.signal.aborted) return;
    const ok = settled.filter((s) => s.status === 'fulfilled').map((s) => s.value);
    const errors = settled.map((s, i) => (s.status === 'rejected' ? `${targets[i].name}: ${s.reason?.message || s.reason}` : null)).filter(Boolean);
    setState({
      loading: false,
      items: interleave(ok.map((o) => o.items)),
      totalPages: Math.max(1, ...ok.map((o) => o.totalPages)),
      total: ok.reduce((n, o) => n + (o.total || 0), 0),
      errors,
    });
    const u = new URLSearchParams();
    if (query) u.set('q', query);
    u.set('source', src);
    if (!pub) u.set('public', '0');
    if (pg > 1) u.set('page', String(pg));
    window.history.replaceState({}, '', `/search?${u}`);
  }, []);

  useEffect(() => { run(q, source, publicOnly, page); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [source, publicOnly, page]);
  useEffect(() => () => abort.current?.abort(), []);

  const submit = (e) => { e.preventDefault(); if (page === 1) run(q, source, publicOnly, 1); else setPage(1); };
  const random = () => setPage(1 + Math.floor(Math.random() * Math.max(1, Math.min(state.totalPages, 500))));
  const active = source === 'all' ? providers : [providerById[source]];

  return (
    <section className="page">
      <h1>Search</h1>
      <p className="muted">Search museum and library collections that publish IIIF manifests. Leave the box empty to browse.</p>
      <form className="row" onSubmit={submit} role="search">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. water lilies, anatomy, map…" aria-label="Search query" />
        <select value={source} onChange={(e) => { setPage(1); setSource(e.target.value); }} aria-label="Source">
          {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          <option value="all">All sources</option>
        </select>
        <label className="check"><input type="checkbox" checked={publicOnly} onChange={(e) => { setPage(1); setPublicOnly(e.target.checked); }} /> Public domain / open only</label>
        <button type="submit">Search</button>
        <button type="button" className="ghost" onClick={random}>Random page</button>
      </form>
      {notice && <p role="status" className="status">{notice}</p>}
      {state.errors.map((e) => <p key={e} className="error">{e}</p>)}
      {state.loading && <p className="muted">Loading…</p>}
      {!state.loading && !state.errors.length && !state.items.length && <p className="muted">No results.</p>}
      <ul className="grid">
        {state.items.map((it) => (
          <li key={`${it.source}:${it.id}`} className="card">
            {it.thumbnail ? <img src={it.thumbnail} alt="" loading="lazy" /> : <div className="noimg">No preview</div>}
            <div className="card-body">
              <strong title={it.title}>{it.title}</strong>
              <span className="muted small">{[it.creator, it.date].filter(Boolean).join(' · ')}</span>
              <span className="muted small">{providerById[it.source].name} · {it.rights}</span>
              <div className="row small">
                <button onClick={() => navigate(viewerUrl([it.manifestUrl]))}>Open</button>
                <button className="ghost" onClick={() => { const n = addToCollage([{ url: it.manifestUrl, title: it.title, thumbnail: it.thumbnail }]); setNotice(n ? `Added “${it.title}” to your collage.` : 'Already in your collage.'); }}>Add to collage</button>
                <a className="ghost-link" href={it.pageUrl} target="_blank" rel="noreferrer">Source ↗</a>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="row pager">
        <button className="ghost" disabled={page <= 1 || state.loading} onClick={() => setPage(page - 1)}>← Previous</button>
        <span className="muted">Page {page} of {state.totalPages}{state.total ? ` · ${state.total.toLocaleString()} results` : ''}</span>
        <button className="ghost" disabled={page >= state.totalPages || state.loading} onClick={() => setPage(page + 1)}>Next →</button>
      </div>
      <footer className="attrib">{active.map((p) => <p key={p.id}>{p.attribution} <a href={p.termsUrl} target="_blank" rel="noreferrer">Terms</a></p>)}</footer>
    </section>
  );
}
