---
title: Own manifests
date generated: 2026-11-27
tags: [manifests, iiif, scripts, hosting, presentation-3]
info: Use when you want to publish your own IIIF manifest from images that already have an IIIF image service.
category: how-to
description: How scripts/make-manifest.mjs builds a Presentation 3.0 manifest from Image API info.json URLs, with the example used, serving details and limits.
---

# Own manifests

`scripts/make-manifest.mjs` builds a IIIF Presentation 3.0 manifest from one or more IIIF Image API `info.json` URLs and writes `public/manifests/<name>.json`.

```bash
node scripts/make-manifest.mjs --name my-item --label "My item" \
  --rights https://creativecommons.org/publicdomain/zero/1.0/ \
  https://example.org/iiif/2/some-image/info.json
```

Options: `--name` (lowercase slug, required), `--label` (required), `--summary`, `--rights` (URL), `--attribution`, `--base` (default `https://iiif.glosse.me`). One canvas per `info.json`; Image API 2 and 3 are detected; the manifest `id` is `{base}/manifests/{name}.json`.

## Example that was generated

```bash
node scripts/make-manifest.mjs --name sunday-on-la-grande-jatte --label "A Sunday on La Grande Jatte — 1884" --summary "Example manifest built from the Art Institute of Chicago's public-domain image (Georges Seurat, 1884–86)." --rights https://creativecommons.org/publicdomain/zero/1.0/ --attribution "Art Institute of Chicago, Helen Birch Bartlett Memorial Collection (public domain, CC0)" https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/info.json
```

Result: one canvas, 9310 x 6237, Image API 2 service; file `public/manifests/sunday-on-la-grande-jatte.json`. Source: [AIC object 27992](https://api.artic.edu/api/v1/artworks/27992) (`is_public_domain: true`).

## Serving

- Files in `public/` are copied to `dist/`. `public/_headers` adds CORS (`Access-Control-Allow-Origin: *`) and `application/ld+json` to `/manifests/*` ([[cloudflare-deploy]]).
- Add a row to `public/gallery.csv` to list it ([[gallery-and-collage]]).
- The manifest URL works at `https://iiif.glosse.me/manifests/{name}.json` only after deploy.

## Limits

- Not run through the official IIIF validator.
- It loads in Mirador locally and its image service `info.json` returns 200 (checked 2026-11-27).
- This only publishes manifests for images already served by an IIIF image server. Hosting your own images needs an IIIF Image API server, which static Pages cannot run (not built).
