import { useState } from 'react';
import { useCollage } from '../lib/useCollage.js';
import { addToCollage, setCollage } from '../lib/collageStore.js';
import { buildCollection, fetchManifestSummary, mapLimit, parseManifestLines } from '../lib/manifest.js';
import { downloadBlob, renderCollagePng } from '../lib/exportPng.js';
import { navigate, viewerUrl } from '../lib/router.jsx';

export default function Collage() {
  const items = useCollage();
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function addLines() {
    const urls = parseManifestLines(text);
    if (!urls.length) { setStatus('Paste manifest URLs (http/https), one per line.'); return; }
    setBusy(true);
    setStatus(`Checking ${urls.length} manifest(s)…`);
    const results = await mapLimit(urls, 4, (u) => fetchManifestSummary(u));
    const good = results.filter((r) => r.ok).map((r) => r.value);
    const bad = urls.filter((_, i) => !results[i].ok);
    const added = addToCollage(good);
    setBusy(false);
    setText(bad.join('\n'));
    setStatus(`Added ${added} item(s).${bad.length ? ` ${bad.length} line(s) failed and were left in the box (not a reachable IIIF manifest).` : ''}`);
  }

  function move(i, d) {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setCollage(next);
  }

  const urls = items.map((i) => i.url);
  const link = `${window.location.origin}${viewerUrl(urls)}`;

  async function copyLink() {
    try { await navigator.clipboard.writeText(link); setStatus('Link copied.'); } catch { setStatus('Copy failed; select the link below.'); }
  }

  function downloadJson() {
    const coll = buildCollection(items, 'Collage from iiif.glosse.me');
    downloadBlob(new Blob([JSON.stringify(coll, null, 2)], { type: 'application/ld+json' }), 'collage-collection.json');
  }

  async function downloadPng() {
    setBusy(true); setStatus('Rendering collage…');
    try {
      const { blob, failed } = await renderCollagePng(items);
      downloadBlob(blob, 'collage.png');
      setStatus(failed.length ? `Downloaded. ${failed.length} image(s) could not be loaded and show a placeholder.` : 'Downloaded.');
    } catch (e) { setStatus(`PNG export failed: ${e.message}`); }
    setBusy(false);
  }

  return (
    <section className="page">
      <h1>Collage</h1>
      <p className="muted">Paste IIIF manifest URLs, one per line. Arrange them, then export a shareable link, an IIIF Collection JSON, or a PNG collage.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={'https://ids.si.edu/ids/manifest/FS-8106_01\nhttps://api.artic.edu/api/v1/artworks/27992/manifest.json'} aria-label="Manifest URLs, one per line" />
      <div className="row">
        <button onClick={addLines} disabled={busy}>Add to collage</button>
        <button className="ghost" onClick={() => setCollage([])} disabled={!items.length}>Clear all</button>
      </div>
      {status && <p role="status" className="status">{status}</p>}

      {items.length > 0 && (
        <>
          <div className="row export">
            <button onClick={() => navigate(viewerUrl(urls))}>Compare in viewer</button>
            <button onClick={copyLink}>Copy shareable link</button>
            <button onClick={downloadJson}>Download IIIF Collection (JSON)</button>
            <button onClick={downloadPng} disabled={busy}>Download PNG collage</button>
          </div>
          <input className="linkbox" readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Shareable link" />
          <ul className="grid">
            {items.map((it, i) => (
              <li key={it.url} className="card">
                {it.thumbnail ? <img src={it.thumbnail} alt="" loading="lazy" /> : <div className="noimg">No preview</div>}
                <div className="card-body">
                  <strong title={it.title}>{it.title}</strong>
                  <div className="row small">
                    <button className="ghost" onClick={() => move(i, -1)} aria-label="Move earlier">←</button>
                    <button className="ghost" onClick={() => move(i, 1)} aria-label="Move later">→</button>
                    <button className="ghost" onClick={() => setCollage(items.filter((x) => x.url !== it.url))}>Remove</button>
                    <button className="ghost" onClick={() => navigate(viewerUrl([it.url]))}>Open</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
