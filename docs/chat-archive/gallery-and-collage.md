---
title: Gallery and collage
date generated: 2026-11-27
tags: [gallery, collage, csv, export, localstorage]
info: Use when editing the CSV gallery, changing how the collage works, or debugging an export.
category: feature
description: How the CSV-driven gallery (the page for visitors with no manifest list) and the collage maker with three export formats are built, with their formats and pitfalls.
---

# Gallery and collage

## Gallery (`/`, `src/pages/Gallery.jsx`)

Purpose: visitors who arrive without a manifest list can browse and open items. It is the landing page when `/` has no `?manifest=`.

`public/gallery.csv` columns (header row required, matched case-insensitively):

```csv
manifest_url,title,thumbnail,collection,notes
https://ids.si.edu/ids/manifest/FS-8106_01,,,Smithsonian,National Museum of Asian Art
https://api.artic.edu/api/v1/artworks/27992/manifest.json,,,Art Institute of Chicago,
https://iiif.archive.org/iiif/claude-monet-detail-of-clear-morning-with-willows-endlos/manifest.json,,,Internet Archive,
https://iiif.wellcomecollection.org/presentation/v2/b22396147,,,Wellcome Collection,
https://iiif.glosse.me/manifests/sunday-on-la-grande-jatte.json,A Sunday on La Grande Jatte (own manifest),"https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/!300,300/0/default.jpg",iiif.glosse.me,Example generated with scripts/make-manifest.mjs
```

- Only rows whose `manifest_url` starts with `http(s)://` are used.
- Empty `title` or `thumbnail` is filled by fetching the manifest (4 at a time, results cached). A manifest that fails shows "Unavailable" and does not break the page.
- Filter box (title, collection, notes) and a collection dropdown.
- Buttons per card: **View** (item page), **Viewer** (full Mirador), **Add to collage**.
- The last row points at `iiif.glosse.me`, which only exists after deploy. It has title and thumbnail set, so it renders without fetching.
- Parser: `src/lib/csv.js` (quoted fields, escaped quotes, CRLF).
- **Pitfall (found while writing this archive):** any field containing a comma must be quoted. IIIF size strings like `!300,300` contain one. The first version of the last row left that thumbnail URL unquoted, so the parser cut it at the comma (thumbnail `…/full/!300`, collection `300/0/default.jpg`). The row above is the corrected, quoted version; the fix is on the `docs-archive` branch. Alternative: use a size form without a comma, such as `/full/300,/0/default.jpg`.

## Collage (`/collage`, `src/pages/Collage.jsx`)

- Paste IIIF manifest URLs, one per line. `parseManifestLines` keeps only `http(s)` lines and removes duplicates.
- Each line is fetched and checked (`fetchManifestSummary`, 4 at a time). Lines that are not a reachable IIIF manifest stay in the textarea; the rest are added.
- Collage list: reorder (← →), remove, open, clear all. Stored in `localStorage` key `iiif.collage.v1` (falls back to memory if storage is unavailable). Nav shows the count.
- "Add to collage" exists on gallery cards, search results and the item page.

### Export (all three were requested)

| Export | How |
| --- | --- |
| Shareable link | `${origin}/viewer?manifest=A&manifest=B…`, copy button and read-only box |
| IIIF Collection JSON | download `collage-collection.json` |
| PNG collage | download `collage.png`, rendered in the browser |

Collection JSON shape (`buildCollection` in `src/lib/manifest.js`):

```json
{
  "@context": "http://iiif.io/api/presentation/3/context.json",
  "id": "urn:uuid:…",
  "type": "Collection",
  "label": { "en": ["Collage from iiif.glosse.me"] },
  "items": [
    { "id": "<manifest url>", "type": "Manifest", "label": { "en": ["<title>"] },
      "thumbnail": [{ "id": "<thumb url>", "type": "Image" }] }
  ]
}
```

PNG (`src/lib/exportPng.js`): grid with `cols = ceil(sqrt(n))`, 320 px cells, cover-fit, title strip along the bottom. Images are loaded with `crossOrigin = 'anonymous'`. An image that cannot load (network or CORS) gets an "Image unavailable" placeholder and the export still finishes; the page reports how many failed. Sources with CORS headers were checked (AIC, Wellcome, V&A, IA, Met). Thumbnails from IA and Wellcome are low resolution, so the PNG looks soft.

Tested in headless Chromium with a Wellcome and an IA manifest plus a bad URL: 2 added, 1 left in the box; JSON had 2 items; PNG was 159979 bytes.
