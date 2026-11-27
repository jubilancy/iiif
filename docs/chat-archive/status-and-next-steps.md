---
title: Status and next steps
date generated: 2026-11-27
tags: [status, todo, roadmap, unverified]
info: Read before starting new work, to avoid redoing finished items or trusting unverified ones.
category: status
description: What is done, what is built but unverified, and what remains, as of 2026-11-27, with the open decisions.
---

# Status and next steps

Repo `main` at `c35afe1`. Live copy of this list: `docs/TODO.md` in the repo (it matches the state below except for items added after the merge).

## Done and checked

- Vite + React 19 + Mirador 4 app builds ([[setup-and-build]]).
- Viewer with 9 plugins plus branding ([[mirador-plugins]]), light/dark theme, `/embed`.
- CSV gallery, collage with link/JSON/PNG export ([[gallery-and-collage]]).
- Search over V&A, Art Institute of Chicago, Wellcome, Internet Archive ([[search-providers]]).
- Item page ([[item-page]]); own-manifest script ([[own-manifests]]); manifest check script and sources list ([[source-verification]]).
- MIT licence, README, `docs/DEPLOY.md`, `docs/SOURCES.md`.

## Built but unverified

- In-browser rendering of AIC, Smithsonian, Wellcome image tiles and Library of Congress (blocked headless agent; test in your own browser).
- Every institution except V&A and Internet Archive in a browser; the rest only by the Node script.
- `mirador-textoverlay` stays opt-in until checked on a real OCR manifest.
- Plugin overlaps: `dl-plugin` vs `downloaddialog`; `canvasnavigation` replacing a built-in.
- Own manifest not run through the official IIIF validator.
- `_headers` CORS on `/manifests/*` (only testable after deploy).
- Wellcome's overall reuse terms (per-item licence is shown).
- Bodleian flaked with 503 on re-runs.

## Not done

- **Cloudflare Pages project and `iiif.glosse.me` domain** ([[cloudflare-deploy]]). Yours to do in the dashboard.
- Server storage for annotations (needs a backend, e.g. Cloudflare Workers + KV/D1, or an annotation server such as Aiiinotate; currently browser-only).
- Library of Congress provider (manifests blocked to automation).
- The Met as an optional source (needs generated manifests).
- URL-bar manifest input on the viewer page (today: Mirador's "Add resource" or the collage page).
- Screenshots in the docs after the first deploy.
- Browser-only vs a Cloudflare Worker cache/proxy decision.

## Changed after the merges (branch `docs-archive`)

- `public/gallery.csv`: quoted the thumbnail field of the last row, which contains a comma ([[gallery-and-collage]]).
- `docs/chat-archive/`: these notes.

## Ideas mentioned, not decided

- Add the verified manifests from [[source-verification]] to `public/gallery.csv` so the gallery spans more institutions.
- Add more providers (a pattern exists per [[search-providers]]).
- Item page shortcuts for more providers once a deterministic manifest URL pattern exists.

## Open question

- None blocking. Merge `docs-archive` when you want the archive and the CSV fix on `main`.
