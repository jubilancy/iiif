import { useEffect, useMemo, useState } from 'react';
import DeepZoom from '../components/DeepZoom.jsx';
import RichText from '../components/RichText.jsx';
import Viewer from './Viewer.jsx';
import { loadManifest, bestFit, imageUrl } from '../lib/iiif.js';
import { addToCollage } from '../lib/collageStore.js';
import { providerById } from '../providers/index.js';
import { navigate, Link, viewerUrl } from '../lib/router.jsx';

// /item?manifest=URL            any IIIF manifest
// /item/vam/O1155200[/slug]     provider shortcuts (same shape as the V&A's own item URLs)
function resolveManifest(path, search) {
  const sp = new URLSearchParams(search);
  const direct = sp.get('manifest');
  if (direct) return { url: direct, provider: sp.get('source') || '' };
  const m = path.match(/^\/item\/([^/]+)\/([^/]+)/);
  if (m) {
    const p = providerById[m[1]];
    if (p?.manifestFor) return { url: p.manifestFor(decodeURIComponent(m[2])), provider: m[1] };
  }
  return { url: '', provider: '' };
}

function downloads(canvas) {
  if (canvas?.service) {
    const b = canvas.service.base;
    return [
      ['Small (400 px)', bestFit(b, 400)],
      ['Medium (1000 px)', bestFit(b, 1000)],
      ['Large (2000 px)', bestFit(b, 2000)],
      ['Full size', imageUrl(b, canvas.service.version === 3 ? 'max' : 'full')],
    ];
  }
  return canvas?.image ? [['Image', canvas.image]] : [];
}

export default function Item({ path, search, theme, disable, enable }) {
  const { url, provider } = useMemo(() => resolveManifest(path, search), [path, search]);
  const [state, setState] = useState({ loading: Boolean(url), error: '', m: null });
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState('zoom');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!url) { setState({ loading: false, error: '', m: null }); return undefined; }
    const ctl = new AbortController();
    setState({ loading: true, error: '', m: null });
    setIndex(0);
    loadManifest(url, ctl.signal)
      .then((m) => { setState({ loading: false, error: '', m }); document.title = `${m.title} · IIIF at glosse.me`; })
      .catch((e) => !ctl.signal.aborted && setState({ loading: false, error: e.message || String(e), m: null }));
    return () => ctl.abort();
  }, [url]);

  const [manifestInput, setManifestInput] = useState('');
  if (!url) {
    return (
      <section className="page">
        <h1>Item page</h1>
        <p className="muted">Enter a IIIF manifest URL to get a collections-style item page: deep zoom served straight from the source's IIIF image server, its metadata, and a link back to the manifest.</p>
        <form className="row" onSubmit={(e) => { e.preventDefault(); if (manifestInput.trim()) navigate(`/item?manifest=${encodeURIComponent(manifestInput.trim())}`); }}>
          <input type="url" required value={manifestInput} onChange={(e) => setManifestInput(e.target.value)} placeholder="https://iiif.vam.ac.uk/collections/O1155200/manifest.json" aria-label="Manifest URL" />
          <button type="submit">Open</button>
        </form>
        <p className="muted small">Or use a shortcut like <Link to="/item/vam/O1155200">/item/vam/O1155200</Link>. Providers: {Object.values(providerById).filter((p) => p.manifestFor).map((p) => p.id).join(', ')}.</p>
      </section>
    );
  }
  if (state.loading) return <section className="page"><p className="muted">Loading manifest…</p></section>;
  if (state.error) return (
    <section className="page">
      <h1>Could not load this item</h1>
      <p className="error">{state.error}</p>
      <p className="muted small">Manifest: <a href={url} target="_blank" rel="noreferrer">{url}</a></p>
    </section>
  );

  const m = state.m;
  if (m.isCollection) {
    return (
      <section className="page">
        <h1>{m.title}</h1>
        <p className="muted">This URL is a IIIF Collection, not a single item.</p>
        <ul>{m.children.map((c) => <li key={c.url}><Link to={`/item?manifest=${encodeURIComponent(c.url)}`}>{c.title || c.url}</Link></li>)}</ul>
      </section>
    );
  }

  const canvas = m.canvases[index];
  const dl = downloads(canvas);
  const pageLink = m.links.find((l) => l.label === 'Source page') || m.links[0];
  const prov = provider && providerById[provider];

  async function copy(t, msg) {
    try { await navigator.clipboard.writeText(t); setNotice(msg); } catch { setNotice('Copy failed; select the text instead.'); }
  }

  return (
    <article className="item">
      <header className="item-head">
        <div>
          <p className="muted small">{prov ? prov.name : m.provider?.name || 'IIIF item'}</p>
          <h1>{m.title}</h1>
          {m.summary && m.summary !== m.title && <p className="lede"><RichText html={m.summary} /></p>}
        </div>
        {m.logo && <img className="item-logo" src={m.logo} alt={m.provider?.name || 'Provider logo'} />}
      </header>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'zoom'} className={tab === 'zoom' ? 'on' : 'ghost'} onClick={() => setTab('zoom')}>Zoom</button>
        <button role="tab" aria-selected={tab === 'viewer'} className={tab === 'viewer' ? 'on' : 'ghost'} onClick={() => setTab('viewer')}>Full viewer (plugins)</button>
      </div>

      <div className="item-main">
        <div className="item-stage">
          {tab === 'zoom' ? <DeepZoom canvas={canvas} /> : (
            <div className="item-viewer-box"><Viewer manifests={[url]} theme={theme} disable={disable} enable={enable} /></div>
          )}
          {m.canvases.length > 1 && (
            <ul className="thumbs" aria-label="Pages">
              {m.canvases.map((c, i) => (
                <li key={c.id}>
                  <button className={i === index ? 'thumb on' : 'thumb ghost'} onClick={() => { setIndex(i); setTab('zoom'); }} aria-label={`Show ${c.label}`} aria-current={i === index}>
                    {c.thumb ? <img src={c.thumb} alt="" loading="lazy" /> : c.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="item-side">
          <h2>Links</h2>
          <ul className="plain">
            <li><a href={url} target="_blank" rel="noreferrer">IIIF manifest (JSON)</a> <span className="muted small">Presentation {m.version}.x</span></li>
            {pageLink && <li><a href={pageLink.url} target="_blank" rel="noreferrer">{pageLink.label} ↗</a></li>}
            {canvas?.service && <li><a href={`${canvas.service.base}/info.json`} target="_blank" rel="noreferrer">Image service (info.json)</a> <span className="muted small">Image API {canvas.service.version}.x</span></li>}
            <li><Link to={viewerUrl([url])}>Open in the full-page viewer</Link></li>
            <li><a href={`/embed?manifest=${encodeURIComponent(url)}`}>Embeddable viewer</a></li>
          </ul>
          <div className="row small">
            <button className="ghost" onClick={() => copy(url, 'Manifest URL copied.')}>Copy manifest URL</button>
            <button className="ghost" onClick={() => { const n = addToCollage([{ url, title: m.title, thumbnail: m.canvases[0]?.thumb || '' }]); setNotice(n ? 'Added to your collage.' : 'Already in your collage.'); }}>Add to collage</button>
          </div>
          {notice && <p role="status" className="status small">{notice}</p>}

          {dl.length > 0 && (
            <>
              <h2>Images</h2>
              <ul className="plain">
                {dl.map(([label, href]) => <li key={label}><a href={href} target="_blank" rel="noreferrer">{label}</a></li>)}
              </ul>
              <p className="muted small">Served directly by the source's IIIF image server. Check the rights below before reuse.</p>
            </>
          )}

          <h2>Rights</h2>
          <p className="small">
            {m.attribution ? <RichText html={m.attribution} /> : <span className="muted">No attribution statement in the manifest.</span>}
            {m.rights && <> · <a href={m.rights} target="_blank" rel="noreferrer">Rights statement</a></>}
          </p>
        </aside>
      </div>

      {m.metadata.length > 0 && (
        <section className="item-details">
          <h2>Details</h2>
          <dl>
            {m.metadata.map((p, i) => (
              <div key={`${p.label}-${i}`} className="kv">
                <dt>{p.label}</dt>
                <dd>{p.values.map((v, j) => <p key={j}><RichText html={v} /></p>)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </article>
  );
}
