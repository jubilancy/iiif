# TODO: iiif.glosse.me

A Mirador-based IIIF viewer and manifest gallery, deployed on Cloudflare at `iiif.glosse.me`.

## Decisions made

- **Build step: yes** (npm + Vite). Mirador plugins require the ES module build; the UMD/CDN build does not support them ([mirador-integration README](https://github.com/ProjectMirador/mirador-integration)).
- **Mirador 4**, not 3. npm `latest` for `mirador` is 4.3.0, and the maintained plugins below all declare `mirador ^4` peer dependencies.
- **React 19** (required by `mirador-dl-plugin` and `mirador-annotation-editor`).
- Hosting: Cloudflare Pages, custom domain `iiif.glosse.me`.

## Open questions

- [ ] Collage export format: what should "export" produce? Options: (a) shareable link (`/?manifest=a&manifest=b…`), (b) a combined IIIF Collection JSON file to download, (c) a flattened image collage (PNG). Default plan: do (a) and (b) first.
- [ ] `docs/` is source-only. The deployed site is the Vite build output (`dist/`), so `docs/TODO.md` will not be served unless we copy it into `public/`. Confirm that's what is wanted.
- [ ] Repo visibility (public/private) and license.

## Phase 1: Scaffold

- [ ] `npm create vite` (vanilla or React) in repo root; add `.gitignore`, `package.json`
- [ ] Install `mirador`, `react`, `react-dom`, `react-i18next`, `@emotion/react`, `@emotion/styled`, `@mui/material`, `@mui/system` (dependency list from the mirador-integration README; confirm versions against `mirador` peerDependencies)
- [ ] Minimal viewer at `/` that mounts `Mirador.viewer({ id: 'mirador' })`
- [ ] Read `?manifest=` (support multiple values) and open each in its own window
- [ ] Local dev + production build working

## Phase 2: Cloudflare deploy

- [ ] Create Cloudflare Pages project connected to `jubilancy/iiif` (verify build command and output dir against the Pages Vite docs)
- [ ] Add custom domain `iiif.glosse.me` in the Pages dashboard first, then DNS CNAME to `<project>.pages.dev` (if glosse.me DNS is not on Cloudflare)
- [ ] Add `_redirects` / `_headers` as needed (SPA routes `/embed`, CORS for `/manifests/*`)

## Phase 3: Plugins (all Mirador 4-compatible found on npm)

Verified peer dependencies via the npm registry:

- [ ] `mirador-image-tools` (mirador ^4)
- [ ] `mirador-share-plugin` (mirador ^4)
- [ ] `mirador-dl-plugin` (mirador ^4, react ^19)
- [ ] `mirador-annotation-editor` (mirador ^4.2.3, react >=19), for creating annotations
- [ ] `mirador-textoverlay` (mirador 4.x), selectable OCR/transcription text
- [ ] `mirador-canvaslink` (Mirador 4)
- [ ] `mirador-downloaddialog` (Mirador 4)
- [ ] `mirador-imagecropper` (Mirador 4)
- [ ] `mirador-keyboardshortcuts` (Mirador 4)
- [ ] `mirador-canvasnavigation` (Mirador 4; **replaces** the built-in canvas navigation, may conflict with others, test)

Evaluate / probably skip:

- `mirador-annotations` 0.5.0: Mirador 3 only (peer `mirador ^3`), superseded by `mirador-annotation-editor`
- `@harvard-lts/mirador-*` (analytics, help, login, eda, pdf, harvard-custom, hide-nav, url-sync, annotations-auth): built for Harvard's viewer; review each before use
- `mirador-jump-to-page`: last published 2017, likely M2/M3-era

For each plugin: install, register in the plugins array, confirm no conflicts, record any config in `docs/`.

## Phase 4: Eliana's gallery (default landing for visitors with no manifest list)

Purpose: anyone who arrives without manifest URLs can browse a curated set and open items. Driven by a CSV.

- [ ] Define `public/gallery.csv` schema (suggested: `manifest_url,title,thumbnail,collection,notes`)
- [ ] Parse CSV in the browser (fetch at load) and render a card grid
- [ ] Click card → open in viewer (`/?manifest=...`); multi-select → compare view
- [ ] Search/filter by title, collection
- [ ] Handle bad/unreachable manifests gracefully (skip + show placeholder)
- [ ] Landing page (`/` with no `?manifest=`) shows the gallery
- [ ] Support IIIF Presentation 2.x and 3.x manifests (the Smithsonian one is 2.x)

### Collage

- [ ] Collage page: textarea, one manifest URL per line
- [ ] Validate each line (fetch, check it is a IIIF manifest, report failures per line without blocking the rest)
- [ ] Preview the collected items as a grid; reorder/remove before export
- [ ] Export: shareable multi-manifest link; downloadable IIIF Collection JSON (see open question for other formats)
- [ ] "Add to collage" button on gallery cards

## Phase 5: Own manifests

- [ ] `public/manifests/` folder served as static JSON
- [ ] CORS header for `/manifests/*` so other viewers can load them
- [ ] Document how to add a manifest and a gallery row
- [ ] (Later) image hosting needs an IIIF Image API server; out of scope for static Pages

## Phase 6: Viewer polish

- [ ] URL-bar manifest input on the landing page
- [ ] Light/dark theme
- [ ] Shareable-link button (via share plugin)
- [ ] `/embed` route for iframes (chrome-less viewer)
- [ ] glosse.me branding via a `Branding` wrap plugin ([plugin docs](https://github.com/ProjectMirador/mirador/wiki/M3---Mirador-3-plugins))

## Phase 7: Annotations

- [ ] Viewing existing annotations works out of the box
- [ ] Decide storage for created annotations (annotation editor needs a backend / adapter; e.g., Cloudflare Workers + KV/D1)
- [ ] Wire `mirador-annotation-editor` to the chosen storage

## Docs

- [ ] README: what this is, how to run, how to add manifests
- [ ] Keep this file updated as items finish
