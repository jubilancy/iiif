#!/usr/bin/env node
// Checks IIIF manifests the way the item page reads them: fetch, normalise (src/lib/iiif.js),
// then fetch the first canvas's image-service info.json. Usage:
//   node scripts/check-manifests.mjs <manifest URL> [...]
//   node scripts/check-manifests.mjs --file docs/sources.json
import { readFileSync } from 'node:fs';
import { normalizeManifest } from '../src/lib/iiif.js';

const args = process.argv.slice(2);
let urls = args.filter((a) => /^https?:/.test(a));
const fi = args.indexOf('--file');
if (fi >= 0) urls = JSON.parse(readFileSync(args[fi + 1], 'utf8')).flatMap((s) => s.examples.map((e) => e.manifest));

async function get(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 45000);
  try { return await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json, application/ld+json', Origin: 'https://iiif.glosse.me' } }); } finally { clearTimeout(t); }
}

export async function check(url) {
  const out = { url, ok: false };
  try {
    const r = await get(url);
    out.status = r.status;
    out.cors = r.headers.get('access-control-allow-origin') || '';
    if (!r.ok) return out;
    const m = normalizeManifest(await r.json(), url);
    Object.assign(out, { title: m.title.slice(0, 60), presentation: m.version, collection: m.isCollection, canvases: m.canvases.length });
    const c = m.canvases[0];
    if (c?.service) {
      out.imageApi = c.service.version;
      const ir = await get(`${c.service.base}/info.json`);
      out.infoStatus = ir.status;
      out.infoCors = ir.headers.get('access-control-allow-origin') || '';
    } else if (c?.image) out.imageApi = 'plain image (no service)';
    out.ok = m.isCollection || (m.canvases.length > 0 && (c.service ? out.infoStatus === 200 : Boolean(c.image)));
  } catch (e) { out.error = e.name === 'AbortError' ? 'timeout' : String(e.message || e); }
  return out;
}

if (process.argv[1].endsWith('check-manifests.mjs')) {
  for (const u of urls) console.log(JSON.stringify(await check(u)));
}
