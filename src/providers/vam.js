// Victoria and Albert Museum: https://developers.vam.ac.uk/
// Each record carries its IIIF manifest URL (`_iiif_presentation_url`).
const PER_PAGE = 24;

function map(r) {
  const img = r._images || {};
  return {
    source: 'vam',
    id: r.systemNumber,
    title: r._primaryTitle || r.objectType || 'Untitled',
    creator: r._primaryMaker?.name && r._primaryMaker.name !== 'Unknown' ? r._primaryMaker.name : '',
    date: r._primaryDate || '',
    thumbnail: img._primary_thumbnail || '',
    manifestUrl: img._iiif_presentation_url || `https://iiif.vam.ac.uk/collections/${r.systemNumber}/manifest.json`,
    pageUrl: `https://collections.vam.ac.uk/item/${r.systemNumber}/`,
    rights: 'Subject to V&A terms and conditions',
    hasImage: Boolean(img._primary_thumbnail),
  };
}

export default {
  id: 'vam',
  name: 'Victoria and Albert Museum',
  attribution: 'Data and images from the Victoria and Albert Museum, London; use is subject to the V&A terms and conditions.',
  termsUrl: 'https://www.vam.ac.uk/info/va-websites-terms-conditions',
  manifestFor: (id) => `https://iiif.vam.ac.uk/collections/${encodeURIComponent(id)}/manifest.json`,
  async search({ q, page = 1, signal }) {
    const params = new URLSearchParams({ page_size: String(PER_PAGE), page: String(page), images_exist: '1' });
    if (q) params.set('q', q);
    const r = await fetch(`https://api.vam.ac.uk/v2/objects/search?${params}`, { signal });
    if (!r.ok) throw new Error(`V&A returned HTTP ${r.status}`);
    const d = await r.json();
    return { items: d.records.map(map).filter((i) => i.hasImage), page: d.info.page, totalPages: Math.min(d.info.pages, 400), total: d.info.record_count };
  },
};
