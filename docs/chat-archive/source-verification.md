---
title: Source verification
date generated: 2026-11-27
tags: [sources, verification, iiif, manifests, cors]
info: Use when you need a known-good example manifest for an institution, or want to re-check whether a source still works.
category: reference
description: Which IIIF institutions' manifests were checked, the exact example URLs, what passed and failed, how the check script works, and the pitfalls found.
---

# Source verification

Date: 2026-11-27. Method: `scripts/check-manifests.mjs` in Node, **not a browser**. It fetches the manifest (sending `Origin: https://iiif.glosse.me`), reads it with `src/lib/iiif.js`, then fetches the first canvas's `info.json`.

```bash
node scripts/check-manifests.mjs https://iiif.vam.ac.uk/collections/O1155200/manifest.json
node scripts/check-manifests.mjs --file docs/sources.json   # all examples in docs/sources.json
```

Output is one JSON line per URL: `ok`, `status`, `cors`, `title`, `presentation`, `canvases`, `imageApi`, `infoStatus`, `infoCors`. `docs/SOURCES.md` in the repo has the same table.

## Passed (manifest 200, parsed, `info.json` 200)

| Source | Example manifest | Presentation / Image API | Canvases |
| --- | --- | --- | --- |
| V&A (project) | `https://iiif.vam.ac.uk/collections/O1155200/manifest.json` | 2 / 2 | 2 |
| Art Institute of Chicago (project) | `https://api.artic.edu/api/v1/artworks/27992/manifest.json` | 2 / 2 | 2 |
| Wellcome Collection (project) | `https://iiif.wellcomecollection.org/presentation/v2/b22396147` | 2 / 2 | 24 |
| Internet Archive (project) | `https://iiif.archive.org/iiif/claude-monet-detail-of-clear-morning-with-willows-endlos/manifest.json` | 3 / 3 | 1 |
| Smithsonian (gallery) | `https://ids.si.edu/ids/manifest/FS-8106_01` | 2 / 2 | 1 |
| Princeton University Library | `https://figgy.princeton.edu/concern/scanned_resources/484e82f7-1b84-4df7-a15d-c9b34ac2407a/manifest` | 2 / 2 | 655 |
| Cambridge Digital Library | `https://cudl.lib.cam.ac.uk/iiif/MS-ADD-02351` (the `.json` suffix also works) | 2 / 2 | 44 |
| Getty | `https://media.getty.edu/iiif/manifest/4fc71f54-cd9e-4d68-bb33-3866e5deb530` | 3 / 3 | 1 |
| National Gallery of Art (library images) | `https://libraryimage.nga.gov/manifest/mms/99682033504896.json` | 2 / 2 | 186 |
| Europeana | `https://iiif.europeana.eu/presentation/9200396/BibliographicResource_3000118436165/manifest` | 2 / 2 | 80 |
| University of Edinburgh | `https://librarylabs.ed.ac.uk/iiif/speccollprototype/manifest/be873687/manifest` | 2 / 2 | 5 |
| Bavarian State Library | `https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb00011222/manifest` | 2 / 2 | 128 |
| University of Manchester | `https://www.digitalcollections.manchester.ac.uk/iiif/PR-SPCC-11597` | 2 / 2 | 520 |
| Stanford (PURL) | `https://purl.stanford.edu/sn904cj3429/iiif/manifest` | 2 / 2 | 1 |
| SCTA | `https://scta.info/iiif/plaoulcommentary/sorb/manifest` | 2 / 2 | 452 |
| CODH (Japan) | `http://codh.rois.ac.jp/pmjt/book/200024363/manifest.json` | 2 / 2 | 35 |

Own manifest: `public/manifests/sunday-on-la-grande-jatte.json` parses (Presentation 3, 1 canvas) and its image service `info.json` returns 200 ([[own-manifests]]).

## Not verified

| Source | Example tried | Result |
| --- | --- | --- |
| University of Oxford (Bodleian) | `https://iiif.bodleian.ox.ac.uk/iiif/manifest/e32a277e-91e2-4a6d-8ba6-cc4bad230410.json` (84 canvases) and `…/ae9f6cca-ae5c-4149-8fe4-95e6eca1f73c.json` (576 canvases) | Passed on first run; 503 on later runs, possibly rate limiting from repeated requests. Re-check. |
| Library of Congress | `https://www.loc.gov/item/mss859430239/manifest.json` | 403 to automated clients (Node and headless Chromium). Not worked around. |
| Harvard Art Museums | `https://iiif.harvardartmuseums.org/manifests/object/299843` | Manifest OK (Presentation 2, 7 canvases); `info.json` 403 |
| Harvard Library | `https://iiif.lib.harvard.edu/manifests/drs:48309543` | 403 |
| BnF Gallica | `https://gallica.bnf.fr/iiif/ark:/12148/btv1b8432379g/manifest.json` | 403 (the URL was a pattern guess) |
| Göttingen | `https://manifests.sub.uni-goettingen.de/iiif/presentation/PPN857449303/manifest` | 404 (ID from a IIIF guide) |
| Everything else on the IIIF Consortium member list you pasted | none | untested |

Other example manifests seen on IIIF pages but not tested: `https://diva.simssa.ca/try/basic-manifest/`, `https://iaw-server.ardc-hdcl-sia-iaw.cloud.edu.au/api/publications/image-sets/01hm598yb6hc3s7btmqth813mg/manifest`.

## Pitfalls

- **CORS header appears only when the request has an `Origin`.** Wellcome's manifest showed no `Access-Control-Allow-Origin` in a plain request and `*` with `Origin` set. The first version of the script omitted `Origin` and reported a false "no CORS". It now sends one.
- "403" here means "blocked for non-browser/automated clients". It says nothing about whether a normal browser works.
- Where a source (AIC, Wellcome image server, Smithsonian image server) answers 403 to `HeadlessChrome`, in-browser rendering cannot be tested from the sandbox ([[testing-and-sandbox-notes]]).
- Institutions publish manifests at different URL shapes (`/iiif/{id}`, `/manifest`, `/manifest.json`, `…/manifest/{uuid}.json`). Always copy the manifest link from the item page rather than guessing. Where the sources' search results gave a pattern (V&A, AIC, IA, LoC) it is in [[search-providers]].
