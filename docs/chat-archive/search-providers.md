---
title: Search providers
date generated: 2026-11-27
tags: [search, apis, iiif, artic, vam, wellcome, internet-archive, met]
info: Use when adding a search source, fixing a provider, or deciding which collection API to use.
category: reference
description: Endpoints, parameters, response fields, rights and quirks of each collection API checked in the chat, with the provider interface used in src/providers.
---

# Search providers

Provider interface (each file in `src/providers/`):

```js
{ id, name, attribution, termsUrl, manifestFor?(id), search({ q, page, publicOnly, signal }) }
// search resolves to { items, page, totalPages, total }
// item: { source, id, title, creator, date, thumbnail, manifestUrl, pageUrl, rights, hasImage }
```

Providers registered: `vam`, `artic`, `wellcome`, `archive`. Page size 24. All send CORS headers, so the browser calls them directly. All checks below were made on 2026-11-09 to 2026-11-27.

## Art Institute of Chicago (primary)

- Docs: [api.artic.edu/docs](https://api.artic.edu/docs). Rights: all data CC0 except `description` (CC-BY 4.0); see [artic.edu/terms](https://www.artic.edu/terms). Treat images as reusable only when `is_public_domain` is true.
- Browse: `https://api.artic.edu/api/v1/artworks?limit=24&page=1&fields=id,title,artist_display,date_display,image_id,is_public_domain`
- Manifest: `https://api.artic.edu/api/v1/artworks/{id}/manifest.json` (Presentation 2.x)
- Image base: `https://www.artic.edu/iiif/2/{image_id}`; thumbnail `/full/300,/0/default.jpg`
- **Pitfall:** `?q=...` does **not filter**. Every query returned the whole collection (133165 hits) and only re-ranked. Use the Elasticsearch DSL instead:

```text
query[bool][must][0][simple_query_string][query]=water lilies
query[bool][must][0][simple_query_string][default_operator]=and
query[bool][filter][0][term][is_public_domain]=true
```

  `simple_query_string` does not error on unbalanced quotes (checked with `"unbalanced`). "water lilies" public domain gave 19 hits.
- The result window is 10000, so pages are capped at `floor(10000 / 24)` = 416.
- The server answers **403 to the `HeadlessChrome` user agent** (curl-verified). Real browsers get 200.

## Victoria and Albert Museum

- Docs: [developers.vam.ac.uk](https://developers.vam.ac.uk/). Terms: [V&A terms and conditions](https://www.vam.ac.uk/info/va-websites-terms-conditions).
- Search: `https://api.vam.ac.uk/v2/objects/search?q={q}&page_size=24&page=1&images_exist=1`
- Response: `info.record_count`, `info.pages`, `info.page`; each record has `systemNumber`, `_primaryTitle`, `_primaryMaker.name`, `_primaryDate`, `_images._primary_thumbnail`, `_images._iiif_presentation_url`.
- Manifest pattern: `https://iiif.vam.ac.uk/collections/{systemNumber}/manifest.json`. Item page: `https://collections.vam.ac.uk/item/{systemNumber}/`. Images: `https://framemark.vam.ac.uk/collections/{imageId}/…`.
- Accepted the headless test browser (so it is the one source fully tested in-browser).

## Wellcome Collection

- Docs: [developers.wellcomecollection.org](https://developers.wellcomecollection.org/docs/catalogue). Licence varies per item (shown in results). Overall reuse terms were not confirmed; check before launch.
- Search:

```text
https://api.wellcomecollection.org/catalogue/v2/works?pageSize=24&page=1&include=items,contributors,production&items.locations.locationType=iiif-presentation&query={q}&items.locations.license=pdm,cc-0
```

- Manifest: the `iiif-presentation` location url, e.g. `https://iiif.wellcomecollection.org/presentation/v2/b22396147`. A work `id` is **not** the b-number, so there is no `manifestFor` and no `/item/wellcome/{id}` shortcut.
- Thumbnail: `thumbnail.url` (200 px); licence label in `thumbnail.license.label`.
- Image server answers 403 to the `HeadlessChrome` user agent (`info.json`), manifest does not.

## Internet Archive

- Search: `https://archive.org/advancedsearch.php?q=mediatype:image AND (…)&rows=24&page=1&output=json` with `fl[]=identifier&fl[]=title&fl[]=creator&fl[]=date&fl[]=licenseurl&fl[]=possible-copyright-status`; browse sorts with `sort[]=downloads desc`.
- Public-domain filter used: `(possible-copyright-status:NOT_IN_COPYRIGHT OR licenseurl:*publicdomain*)` (accepted by the API).
- Manifest: `https://iiif.archive.org/iiif/{identifier}/manifest.json` (Presentation 3.x, Image API 3.x); `/iiif/3/{identifier}/manifest.json` also returned 200.
- Quirks: `https://iiif.archive.org/iiif/3/nasa/manifest.json` redirects to `collection.json`; some identifiers returned 500 or timed out (e.g. `claude-monet-nymphe`, `bollack-killian-slides-001842`). Thumbnail: `https://archive.org/services/img/{identifier}`.

## Library of Congress (not integrated)

- `https://www.loc.gov/pictures/search/?q=map&fo=json&c=2` responded 200 (slow). `https://www.loc.gov/search/?q=map&fo=json&c=2&fa=online-format:image` timed out once.
- Manifests return 403 to automated clients, so manifests were not verified. Not built.

## The Met (not used)

- Docs: [metmuseum.github.io](https://metmuseum.github.io/). No key; limit 80 requests/second. CC0 open-access data; images in the public domain only.
- Old `/public/collection/v1/search` was **retired on 2026-10-01** (it now returns an error naming the replacement). Use `/public/collection/v1.1/search` with `offset` (default 0) and `limit` (default 100, max 500).
- Search returns only `objectIDs`; details need `GET /public/collection/v1/objects/{id}` (`primaryImage`, `primaryImageSmall`, `additionalImages`, `title`, `artistDisplayName`, …).
- API and image host both sent `Access-Control-Allow-Origin: *`.
- **No IIIF manifests.** `iiif.metmuseum.org` was unreachable (proxy refused the connection) and a guessed manifest URL gave 429, which proves nothing either way. A IIIF viewer would need manifests generated from the JPEG URLs. Kept as an optional later idea.
