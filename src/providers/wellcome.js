// Wellcome Collection catalogue API: https://developers.wellcomecollection.org/docs/catalogue
// Licence varies per item; it is shown with every result.
const API = 'https://api.wellcomecollection.org/catalogue/v2';
const PER_PAGE = 24;

function iiifUrl(w) {
  for (const it of w.items || []) {
    for (const l of it.locations || []) {
      if (l.locationType?.id === 'iiif-presentation') return l.url;
    }
  }
  return '';
}

function map(w) {
  return {
    source: 'wellcome',
    id: w.id,
    title: w.title || 'Untitled',
    creator: w.contributors?.[0]?.agent?.label || '',
    date: w.production?.[0]?.dates?.[0]?.label || '',
    thumbnail: w.thumbnail?.url || '',
    manifestUrl: iiifUrl(w),
    pageUrl: `https://wellcomecollection.org/works/${w.id}`,
    rights: w.thumbnail?.license?.label || w.items?.[0]?.locations?.[0]?.license?.label || 'See source page',
    hasImage: true,
  };
}

export default {
  id: 'wellcome',
  name: 'Wellcome Collection',
  attribution: 'Data and images from Wellcome Collection; licence varies per item and is shown on each result.',
  termsUrl: 'https://wellcomecollection.org/about-us/terms-of-use',
  async search({ q, page = 1, publicOnly = true, signal }) {
    const params = new URLSearchParams({
      pageSize: String(PER_PAGE),
      page: String(page),
      include: 'items,contributors,production',
      'items.locations.locationType': 'iiif-presentation',
    });
    if (q) params.set('query', q);
    if (publicOnly) params.set('items.locations.license', 'pdm,cc-0');
    const r = await fetch(`${API}/works?${params}`, { signal });
    if (!r.ok) throw new Error(`Wellcome returned HTTP ${r.status}`);
    const d = await r.json();
    const items = d.results.map(map).filter((i) => i.manifestUrl);
    return { items, page: d.page ?? page, totalPages: Math.min(d.totalPages ?? 1, 1000), total: d.totalResults };
  },
};
