---
title: Item page
date generated: 2026-11-27
tags: [item-page, openseadragon, iiif, manifest, v-and-a]
info: Use when changing the /item page, supporting a new manifest quirk, or explaining how it reads images from the source server.
category: feature
description: Design and behaviour of the collections-style item page that reads any IIIF manifest and loads images from the source's own IIIF image server, with its tested results.
---

# Item page

Goal (your words): "my own collections item page" like the [V&A item page](https://collections.vam.ac.uk/item/O1155200/the-temptation-of-adam-print-petrini-giovanni/): reads and loads images straight from the source IIIF image server, links to the manifest, with the plugins included.

## Routes

- `/item?manifest=URL[&source=provider]` any manifest.
- `/item/{provider}/{id}[/slug]` for providers that have `manifestFor`: `vam`, `artic`, `archive`. Example: `/item/vam/O1155200`. Wellcome has none (work id is not the b-number).
- `/item` with no manifest shows a URL form.

## What the page shows

- Title, summary, provider name and logo.
- Tabs: **Zoom** (OpenSeadragon on the image service's `info.json`) and **Full viewer (plugins)** (the same Mirador component as `/viewer`, inline).
- Thumbnails when there are several canvases.
- Links: manifest (labelled Presentation 2.x/3.x), source page (`related` / `homepage`), image service `info.json` (labelled Image API version), full-page viewer, embeddable viewer, copy manifest URL, add to collage.
- Image links via the Image API: `!400,400`, `!1000,1000`, `!2000,2000`, and full (`full/full` for Image API 2, `full/max` for 3). If no service, the direct image URL.
- Rights: attribution (`attribution` in 2.x, `requiredStatement` in 3.x) and licence/rights link.
- Details list from the manifest `metadata`.
- Collections: if the URL is a IIIF Collection it lists the child manifests as links.

## Code map

- `src/lib/iiif.js`: `normalizeManifest` turns 2.x or 3.x into one model (`title, summary, metadata, rights, attribution, provider, logo, links, canvases[{service{base,version}, image, thumb, width, height}]`); `langValues` handles language maps; `serviceInfo` detects Image API 2 vs 3; `bestFit(base, w, h)` builds `{base}/full/!w,h/0/default.jpg`; `loadManifest` fetches with a clear error for network/CORS, HTTP and non-manifest JSON.
- `src/components/DeepZoom.jsx`: OpenSeadragon with `tileSources: '{base}/info.json'` (or `{ type: 'image', url }`), `crossOriginPolicy: 'Anonymous'`, own zoom buttons (no CDN icons). On `open-failed` it falls back to a plain `<img>` at `!1400,1400` with a note.
- `src/components/RichText.jsx`: manifest values can contain HTML (the V&A rights value has `<a href>`). It parses with `DOMParser` and rebuilds only `b i em strong br p ul ol li sub sup span` and `a` (http/https hrefs, opened with `rel="noopener noreferrer"`) as React elements. No `dangerouslySetInnerHTML`.

## Tested (headless Chromium)

- V&A `/item/vam/O1155200/the-temptation-of-adam-print-petrini-giovanni`: title correct, 8 detail rows, 2 thumbnails, manifest link correct, OpenSeadragon canvas present, 33 successful requests to `framemark.vam.ac.uk`, no fallback.
- Full viewer tab: Mirador window opened with download, share, crop, image-tools and page navigation controls.
- Internet Archive Presentation 3 manifest: loaded with deep zoom.
- Bad URL (`https://example.com/nope`): "Could not reach that manifest. The address may be wrong, or the server does not allow requests from other sites (CORS)."
- Search (V&A) → **View** button → item page worked.

## Not tested

- Image tiles from AIC, Wellcome, Smithsonian and Library of Congress in a browser from the sandbox (their servers reject the headless user agent, see [[testing-and-sandbox-notes]]).
- Other institutions' manifests in a browser; only a scripted manifest + `info.json` check was run ([[source-verification]]).
- Presentation 3 `Choice` bodies and ranges/structures are handled minimally or not at all (unverified; no manifest using them was tested).
