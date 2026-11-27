# Sources the item page can read

Checked on 2026-11-27 with `node scripts/check-manifests.mjs --file docs/sources.json`. The check fetches the manifest, reads it with the same code as the item page (`src/lib/iiif.js`), then fetches the first canvas's image-service `info.json`. It runs in Node, **not in a browser**: in-browser rendering was tested only for the V&A and the Internet Archive.

The item page is source-agnostic: any IIIF Presentation 2.x or 3.x manifest with Image API 2.x or 3.x services should work via `/item?manifest=URL`. The list below is what has actually been checked.

## Sources in this project

| Source | Example manifest | Result (scripted check) |
| --- | --- | --- |
| Victoria and Albert Museum — Search source; item shortcut /item/vam/{id} | <https://iiif.vam.ac.uk/collections/O1155200/manifest.json> | OK: Presentation 2.x, Image API 2.x, 2 canvases, `info.json` 200 |
| Art Institute of Chicago — Search source; item shortcut /item/artic/{id}; gallery | <https://api.artic.edu/api/v1/artworks/27992/manifest.json> | OK: Presentation 2.x, Image API 2.x, 2 canvases, `info.json` 200 |
| Wellcome Collection — Search source; gallery | <https://iiif.wellcomecollection.org/presentation/v2/b22396147> | OK: Presentation 2.x, Image API 2.x, 24 canvases, `info.json` 200 |
| Internet Archive — Search source; item shortcut /item/archive/{id}; gallery | <https://iiif.archive.org/iiif/claude-monet-detail-of-clear-morning-with-willows-endlos/manifest.json> | OK: Presentation 3.x, Image API 3.x, 1 canvas, `info.json` 200 |
| Smithsonian Institution — Gallery | <https://ids.si.edu/ids/manifest/FS-8106_01> | OK: Presentation 2.x, Image API 2.x, 1 canvas, `info.json` 200 |

Also in the project: **your own manifests** in `public/manifests/` (example: `sunday-on-la-grande-jatte.json`, Presentation 3.0 built from an Art Institute image; the manifest parses and its image service `info.json` returns 200; it is live at `https://iiif.glosse.me/manifests/sunday-on-la-grande-jatte.json` only after you deploy).

## Other IIIF Consortium members that passed

| Source | Example manifest | Result (scripted check) |
| --- | --- | --- |
| University of Oxford (Bodleian Libraries) | <https://iiif.bodleian.ox.ac.uk/iiif/manifest/e32a277e-91e2-4a6d-8ba6-cc4bad230410.json> | Passed on first run (two manifests, 200); **503 on re-runs**, possibly rate limiting. Re-check before relying on it. |
| Princeton University Library | <https://figgy.princeton.edu/concern/scanned_resources/484e82f7-1b84-4df7-a15d-c9b34ac2407a/manifest> | OK: Presentation 2.x, Image API 2.x, 655 canvases, `info.json` 200 |
| Cambridge University Digital Library | <https://cudl.lib.cam.ac.uk/iiif/MS-ADD-02351> | OK: Presentation 2.x, Image API 2.x, 44 canvases, `info.json` 200 |
| The J. Paul Getty Trust | <https://media.getty.edu/iiif/manifest/4fc71f54-cd9e-4d68-bb33-3866e5deb530> | OK: Presentation 3.x, Image API 3.x, 1 canvas, `info.json` 200 |
| National Gallery of Art (library image collections) | <https://libraryimage.nga.gov/manifest/mms/99682033504896.json> | OK: Presentation 2.x, Image API 2.x, 186 canvases, `info.json` 200 |
| Europeana | <https://iiif.europeana.eu/presentation/9200396/BibliographicResource_3000118436165/manifest> | OK: Presentation 2.x, Image API 2.x, 80 canvases, `info.json` 200 |
| University of Edinburgh | <https://librarylabs.ed.ac.uk/iiif/speccollprototype/manifest/be873687/manifest> | OK: Presentation 2.x, Image API 2.x, 5 canvases, `info.json` 200 |
| Bayerische Staatsbibliothek (Bavarian State Library) | <https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb00011222/manifest> | OK: Presentation 2.x, Image API 2.x, 128 canvases, `info.json` 200 |

## Other institutions that passed

| Source | Example manifest | Result (scripted check) |
| --- | --- | --- |
| University of Manchester Library | <https://www.digitalcollections.manchester.ac.uk/iiif/PR-SPCC-11597> | OK: Presentation 2.x, Image API 2.x, 520 canvases, `info.json` 200 |
| Stanford University Libraries (SearchWorks / PURL) | <https://purl.stanford.edu/sn904cj3429/iiif/manifest> | OK: Presentation 2.x, Image API 2.x, 1 canvas, `info.json` 200 |
| Scholastic Commentaries and Texts Archive | <https://scta.info/iiif/plaoulcommentary/sorb/manifest> | OK: Presentation 2.x, Image API 2.x, 452 canvases, `info.json` 200 |
| CODH (Center for Open Data in the Humanities, Japan) | <http://codh.rois.ac.jp/pmjt/book/200024363/manifest.json> | OK: Presentation 2.x, Image API 2.x, 35 canvases, `info.json` 200 |

## Not verified

| Source | Why |
| --- | --- |
| Library of Congress (`https://www.loc.gov/item/mss859430239/manifest.json`) | Server returns 403 to automated clients (Node and headless browser). Not tested; I did not work around it. A normal browser may work. |
| Harvard Art Museums (`https://iiif.harvardartmuseums.org/manifests/object/299843`) | Manifest loads (Presentation 2.x, 7 canvases) but its image server returned 403 for `info.json` in the scripted check. |
| Harvard Library (`https://iiif.lib.harvard.edu/manifests/drs:48309543`) | 403 to the scripted check. |
| BnF Gallica (`https://gallica.bnf.fr/iiif/ark:/12148/btv1b8432379g/manifest.json`) | 403 to the scripted check. This URL was a pattern guess. |
| Göttingen (`https://manifests.sub.uni-goettingen.de/iiif/presentation/PPN857449303/manifest`) | 404; the example ID from a IIIF guide no longer resolves. |
| The Met | Publishes JPEG links, not IIIF manifests. Not a source. |

Every other member on the consortium list you pasted is untested.
