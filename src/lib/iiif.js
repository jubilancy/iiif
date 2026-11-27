// Normalises IIIF Presentation 2.x and 3.x manifests into one small model, and builds
// IIIF Image API URLs (2.x and 3.x both accept the `!w,h` best-fit size form).

export function langValues(v) {
  if (v == null) return [];
  if (typeof v === 'string' || typeof v === 'number') return [String(v)];
  if (Array.isArray(v)) return v.flatMap(langValues);
  if (typeof v === 'object') {
    if ('@value' in v) return langValues(v['@value']);
    if ('value' in v && !('en' in v) && !('none' in v)) return langValues(v.value);
    const keys = Object.keys(v);
    if (!keys.length) return [];
    const pick = ['en', 'none', '@none'].find((k) => k in v) || keys[0];
    return langValues(v[pick]);
  }
  return [];
}

const text = (v) => langValues(v).join(' ').trim();
const arr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const idOf = (o) => (typeof o === 'string' ? o : o?.id || o?.['@id'] || '');
const httpOnly = (u) => (/^https?:\/\//i.test(u || '') ? u : '');

export function serviceInfo(service) {
  const list = arr(service);
  for (const s of list) {
    const id = httpOnly(idOf(s));
    if (!id) continue;
    const ctx = JSON.stringify(s['@context'] || '');
    const type = String(s.type || s['@type'] || '');
    const prof = JSON.stringify(s.profile || '');
    if (/image\/3|ImageService3/.test(`${ctx}${type}`)) return { base: id.replace(/\/$/, ''), version: 3 };
    if (/image\/2|ImageService2|image\/1|ImageService1/.test(`${ctx}${type}${prof}`) || '@id' in s || /iiif/i.test(`${ctx}${prof}`)) {
      return { base: id.replace(/\/$/, ''), version: 2 };
    }
  }
  return null;
}

export const imageUrl = (base, size) => `${base}/full/${size}/0/default.jpg`;
export const bestFit = (base, w, h = w) => imageUrl(base, `!${w},${h}`);

function linkList(m) {
  const links = [];
  const add = (label, v) => arr(v).forEach((x) => {
    const u = httpOnly(idOf(x));
    if (u) links.push({ label: text(x?.label) || label, url: u, format: x?.format || x?.['@format'] || '' });
  });
  add('Source page', m.homepage);
  add('Source page', m.related);
  add('Related', m.seeAlso);
  add('Rendering', m.rendering);
  const seen = new Set();
  return links.filter((l) => (seen.has(l.url) ? false : seen.add(l.url)));
}

function v3Body(canvas) {
  const page = arr(canvas.items)[0];
  const anno = arr(page?.items).find((a) => (a.motivation || '') === 'painting') || arr(page?.items)[0];
  let body = arr(anno?.body)[0];
  if (body?.type === 'Choice') body = arr(body.items)[0];
  return body;
}

function canvasFrom(c, i, v3) {
  let res;
  if (v3) res = v3Body(c);
  else res = arr(c.images)[0]?.resource;
  if (res?.['@type'] === 'oa:Choice') res = arr(res.default)[0] || arr(res.item)[0];
  const svc = serviceInfo(res?.service);
  const direct = httpOnly(idOf(res));
  const thumbRaw = arr(c.thumbnail)[0];
  const thumb = httpOnly(idOf(thumbRaw)) || (serviceInfo(thumbRaw?.service) ? bestFit(serviceInfo(thumbRaw.service).base, 200) : '')
    || (svc ? bestFit(svc.base, 200) : direct);
  return {
    id: idOf(c) || String(i),
    label: text(c.label) || `Image ${i + 1}`,
    width: c.width || res?.width || 0,
    height: c.height || res?.height || 0,
    service: svc,
    image: direct,
    thumb,
    mediaType: res?.type || res?.['@type'] || '',
    format: res?.format || '',
  };
}

export function normalizeManifest(m, url) {
  const type = String(m.type || m['@type'] || '');
  const v3 = type === 'Manifest' || type === 'Collection' || String(m['@context'] || '').includes('/presentation/3');
  const isCollection = /Collection/.test(type);
  const metadata = arr(m.metadata).map((p) => ({ label: text(p.label), values: langValues(p.value) })).filter((p) => p.label && p.values.length);
  const canvases = isCollection ? [] : v3
    ? arr(m.items).map((c, i) => canvasFrom(c, i, true))
    : arr(m.sequences)[0] ? arr(arr(m.sequences)[0].canvases).map((c, i) => canvasFrom(c, i, false)) : [];
  const provider = arr(m.provider)[0];
  const logoSrc = v3 ? arr(provider?.logo)[0] : m.logo;
  const attribution = v3 ? text(m.requiredStatement?.value) : text(m.attribution);
  return {
    url,
    version: v3 ? 3 : 2,
    isCollection,
    title: text(m.label) || url,
    summary: text(v3 ? m.summary : m.description),
    metadata,
    rights: httpOnly(idOf(v3 ? m.rights : m.license) || ''),
    attribution,
    attributionLabel: v3 ? text(m.requiredStatement?.label) : '',
    provider: provider ? { name: text(provider.label), url: httpOnly(idOf(arr(provider.homepage)[0])) } : null,
    logo: httpOnly(idOf(logoSrc)) || (serviceInfo(logoSrc?.service) ? bestFit(serviceInfo(logoSrc.service).base, 200) : ''),
    links: linkList(m),
    direction: m.viewingDirection || '',
    canvases,
    children: isCollection ? arr(m.manifests).concat(arr(m.items)).map((x) => ({ url: httpOnly(idOf(x)), title: text(x.label) })).filter((x) => x.url) : [],
  };
}

export async function loadManifest(url, signal) {
  let r;
  try {
    r = await fetch(url, { signal, headers: { Accept: 'application/json, application/ld+json' } });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error('Could not reach that manifest. The address may be wrong, or the server does not allow requests from other sites (CORS).');
  }
  if (!r.ok) throw new Error(`The manifest server answered HTTP ${r.status}.`);
  let json;
  try { json = await r.json(); } catch { throw new Error('That URL did not return JSON.'); }
  if (!/Manifest|Collection/.test(String(json.type || json['@type']))) throw new Error('That JSON is not a IIIF manifest.');
  return normalizeManifest(json, url);
}
