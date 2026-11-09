// Helpers for IIIF Presentation 2.x and 3.x manifests.

function pickLang(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(pickLang).filter(Boolean)[0] || '';
  if (value['@value']) return value['@value'];
  if (value.value) return pickLang(value.value);
  const langs = Object.keys(value);
  if (!langs.length) return '';
  const preferred = value.en || value.none || value[langs[0]];
  return pickLang(preferred);
}

function thumbOf(m) {
  const t = m.thumbnail;
  if (!t) return '';
  const first = Array.isArray(t) ? t[0] : t;
  if (!first) return '';
  if (typeof first === 'string') return first;
  return first['@id'] || first.id || '';
}

function firstCanvasThumb(m) {
  const canvas = m.items?.[0] || m.sequences?.[0]?.canvases?.[0];
  if (!canvas) return '';
  const t = thumbOf(canvas);
  if (t) return t;
  const img = canvas.images?.[0]?.resource;
  const svc = img?.service;
  const base = (Array.isArray(svc) ? svc[0] : svc)?.['@id'] || (Array.isArray(svc) ? svc[0] : svc)?.id;
  return base ? `${base.replace(/\/$/, '')}/full/!300,300/0/default.jpg` : '';
}

export function summarizeManifest(m, url) {
  return {
    url,
    title: pickLang(m.label) || url,
    thumbnail: thumbOf(m) || firstCanvasThumb(m),
    type: m.type || m['@type'] || '',
    rights: m.rights || m.license || '',
    attribution: pickLang(m.requiredStatement?.value) || pickLang(m.attribution) || '',
  };
}

const cache = new Map();

export function fetchManifestSummary(url) {
  if (!cache.has(url)) {
    cache.set(url, fetch(url, { headers: { Accept: 'application/json, application/ld+json' } })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((m) => {
        const t = m.type || m['@type'];
        if (!/Manifest|Collection/.test(String(t))) throw new Error('Not a IIIF manifest');
        return summarizeManifest(m, url);
      })
      .catch((e) => { cache.delete(url); throw e; }));
  }
  return cache.get(url);
}

// Run async tasks with a concurrency limit; results keep input order.
export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next; next += 1;
      try { out[i] = { ok: true, value: await fn(items[i], i) }; } catch (e) { out[i] = { ok: false, error: e }; }
    }
  });
  await Promise.all(workers);
  return out;
}

export function buildCollection(items, label = 'Collage', id = '') {
  return {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: id || `urn:uuid:${crypto.randomUUID()}`,
    type: 'Collection',
    label: { en: [label] },
    items: items.map((it) => ({
      id: it.url,
      type: 'Manifest',
      label: { en: [it.title || it.url] },
      ...(it.thumbnail ? { thumbnail: [{ id: it.thumbnail, type: 'Image' }] } : {}),
    })),
  };
}

export function parseManifestLines(text) {
  const seen = new Set();
  return text.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^https?:\/\//i.test(l))
    .filter((l) => (seen.has(l) ? false : seen.add(l)));
}
