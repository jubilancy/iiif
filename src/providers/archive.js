// Internet Archive: https://archive.org/advancedsearch.php
// Manifests: https://iiif.archive.org/iiif/{identifier}/manifest.json (can be slow for some items).
const PER_PAGE = 24;

function map(d) {
  const lic = d.licenseurl || '';
  return {
    source: 'archive',
    id: d.identifier,
    title: Array.isArray(d.title) ? d.title[0] : d.title || d.identifier,
    creator: Array.isArray(d.creator) ? d.creator[0] : d.creator || '',
    date: d.date ? String(d.date).slice(0, 10) : '',
    thumbnail: `https://archive.org/services/img/${encodeURIComponent(d.identifier)}`,
    manifestUrl: `https://iiif.archive.org/iiif/${encodeURIComponent(d.identifier)}/manifest.json`,
    pageUrl: `https://archive.org/details/${encodeURIComponent(d.identifier)}`,
    rights: lic || (d['possible-copyright-status'] === 'NOT_IN_COPYRIGHT' ? 'Not in copyright (as marked)' : 'Check rights on source page'),
    hasImage: true,
  };
}

export default {
  id: 'archive',
  name: 'Internet Archive',
  attribution: 'Items from the Internet Archive; rights vary and are shown on each result.',
  termsUrl: 'https://archive.org/about/terms.php',
  async search({ q, page = 1, publicOnly = true, signal }) {
    const clauses = ['mediatype:image'];
    if (q) clauses.push(`(${q})`);
    if (publicOnly) clauses.push('(possible-copyright-status:NOT_IN_COPYRIGHT OR licenseurl:*publicdomain*)');
    const params = new URLSearchParams({ q: clauses.join(' AND '), rows: String(PER_PAGE), page: String(page), output: 'json' });
    if (!q) params.set('sort[]', 'downloads desc');
    ['identifier', 'title', 'creator', 'date', 'licenseurl', 'possible-copyright-status'].forEach((f) => params.append('fl[]', f));
    const r = await fetch(`https://archive.org/advancedsearch.php?${params}`, { signal });
    if (!r.ok) throw new Error(`Internet Archive returned HTTP ${r.status}`);
    const d = await r.json();
    const total = d.response.numFound;
    return { items: d.response.docs.map(map), page, totalPages: Math.min(Math.ceil(total / PER_PAGE), 1000), total };
  },
};
