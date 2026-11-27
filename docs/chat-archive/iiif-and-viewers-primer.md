---
title: IIIF and viewers primer
date generated: 2026-11-27
tags: [iiif, mirador, manifest, viewers, primer]
info: Use when you need to explain how a manifest URL becomes a web page, or pick a viewer.
category: reference
description: What the Smithsonian Mirador URL is, what a IIIF manifest is, the list of IIIF viewers, and how the V&A and Library of Congress expose their manifests.
---

# IIIF and viewers primer

## The URL that started the chat

`https://iiif.si.edu/mirador/?manifest=https%3A%2F%2Fids.si.edu%2Fids%2Fmanifest%2FFS-8106_01`

- It is a [Mirador](https://github.com/ProjectMirador/mirador) viewer page hosted by the Smithsonian. The `manifest` query parameter holds a URL-encoded IIIF manifest URL.
- Checked by fetching the page: a static HTML file that loads `build/mirador/mirador.js`, reads `manifest` with a `getUrlVar("manifest")` function, and passes it to `Mirador({...})` as `loadedManifest` with `viewType: "ImageView"`. It also preloads a list of other Smithsonian manifests. This is the old Mirador 2-style API, not Mirador 4.
- The manifest, [ids.si.edu/ids/manifest/FS-8106_01](https://ids.si.edu/ids/manifest/FS-8106_01), is IIIF Presentation 2.x JSON. Object: *Adoration of the Christ Child*, National Museum of Asian Art, opaque watercolor and gold on paper, 27 x 21.6 cm, Golconda Court, Deccani school; metadata CC0.

## Concepts

- A **manifest** (IIIF [Presentation API](https://iiif.io/api/presentation/3.0/)) is a JSON file describing an object: title, metadata, rights, and a list of canvases (pages). Each canvas points to an image.
- An **image service** (IIIF Image API, `info.json`) serves tiles and sizes of that image. Viewers read `info.json` for deep zoom.
- Any compliant viewer can open any compliant manifest, which is why viewer and content live on different servers.
- Versions seen in practice: Presentation 2.x and 3.x; Image API 2.x and 3.x. Both Image API versions accept the `!w,h` size form.

## Viewers (from [iiif.io viewers](https://iiif.io/get-started/iiif-viewers))

| Viewer | Notes |
| --- | --- |
| [Mirador](https://github.com/ProjectMirador/mirador) | Multi-window, compare, annotations, plugins. Used in this project. |
| [Universal Viewer](https://iiif.io/get-started/iiif-viewers) | Embeddable; images, audio, video, PDF, 3D |
| [Clover](https://iiif.io/get-started/iiif-viewers) | React component; images, sound, video |
| [Tify](https://iiif.io/get-started/iiif-viewers) | Slim, Vue.js |
| [Diva.js](https://iiif.io/get-started/iiif-viewers) | Page-turning for historical documents |
| [OpenSeadragon](https://iiif.io/get-started/iiif-viewers) | Deep-zoom library the others build on. Used directly on the item page. |
| IIIF Curation Viewer, Annona, Micrio SHOW, Glycerine Viewer | Also listed on that page |

Feature comparison: [IIIF Viewer Matrix](https://iiif.io/api/cookbook/recipe/matrix-v4/) (it lists Mirador, UV, Clover, Aviary, Theseus, TIFY, Triiiceratops).

## V&A

- Manifest: `https://iiif.vam.ac.uk/collections/O1155200/manifest.json` (Presentation 2.x, title "The Temptation of Adam").
- Item page `https://collections.vam.ac.uk/item/O1155200/the-temptation-of-adam-print-petrini-giovanni/` is custom-built: it loads images from `framemark.vam.ac.uk` (IIIF Image API) and links to the manifest. Which zoom library it uses was not determined.
- The V&A also publishes Mirador 2 and 3 pages: [iiif.vam.ac.uk/tools](https://iiif.vam.ac.uk/tools/index.html).

## Library of Congress

- Manifest pattern: `https://www.loc.gov/item/{id}/manifest.json` (example `mss859430239`). Image service base: `https://tile.loc.gov/image-services/iiif/{identifier}`.
- Which viewer loc.gov runs on was **not determined**. Its manifests return 403 to automated clients ([[source-verification]]).

## Pitfall

Advice to pin `mirador@^3` on the CDN came from the Mirador README text at the time and is outdated for this project. Use Mirador 4 ([[project-overview-and-decisions]]).
