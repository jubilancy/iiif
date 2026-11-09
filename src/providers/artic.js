// Art Institute of Chicago: https://api.artic.edu/docs
// Data is CC0 (descriptions CC-BY 4.0). Every artwork has a IIIF manifest.
const API = 'https://api.artic.edu/api/v1';
const FIELDS = 'id,title,artist_display,date_display,image_id,is_public_domain';
const PER_PAGE = 24;
const MAX_WINDOW = 10000; // Elasticsearch result window

function map(a) {
  return {
    source: 'artic',
    id: String(a.id),
    title: a.title || 'Untitled',
    creator: (a.artist_display || '').split('\n')[0],
    date: a.date_display || '',
    thumbnail: a.image_id ? `https://www.artic.edu/iiif/2/${a.image_id}/full/300,/0/default.jpg` : '',
    manifestUrl: `${API}/artworks/${a.id}/manifest.json`,
    pageUrl: `https://www.artic.edu/artworks/${a.id}`,
    rights: a.is_public_domain ? 'Public domain (CC0)' : 'Check rights on source page',
    hasImage: Boolean(a.image_id),
  };
}

export default {
  id: 'artic',
  name: 'Art Institute of Chicago',
  attribution: 'Data and images from the Art Institute of Chicago (data CC0; see their terms).',
  termsUrl: 'https://www.artic.edu/terms',
  async search({ q, page = 1, publicOnly = true, signal }) {
    const params = new URLSearchParams({ limit: String(PER_PAGE), page: String(page), fields: FIELDS });
    let url;
    if (q) {
      // `q` alone only re-ranks (it still matches every artwork), so use the Elasticsearch
      // DSL instead: simple_query_string never errors on odd input, and the filter is exact.
      params.set('query[bool][must][0][simple_query_string][query]', q);
      params.set('query[bool][must][0][simple_query_string][default_operator]', 'and');
      if (publicOnly) params.set('query[bool][filter][0][term][is_public_domain]', 'true');
      url = `${API}/artworks/search?${params}`;
    } else {
      url = `${API}/artworks?${params}`;
    }
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error(`AIC returned HTTP ${r.status}`);
    const d = await r.json();
    const items = d.data.filter((a) => a.image_id && (!publicOnly || a.is_public_domain !== false)).map(map);
    return { items, page: d.pagination.current_page, totalPages: Math.min(d.pagination.total_pages, Math.floor(MAX_WINDOW / PER_PAGE)), total: d.pagination.total };
  },
};
