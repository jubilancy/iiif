# TODO: iiif.glosse.me

A Mirador-based IIIF viewer and manifest gallery, deployed on Cloudflare at `iiif.glosse.me`.

## Decisions made

- **Build step: yes** (npm + Vite). Mirador plugins require the ES module build; the UMD/CDN build does not support them ([mirador-integration README](https://github.com/ProjectMirador/mirador-integration)).
- **Mirador 4**, not 3. npm `latest` for `mirador` is 4.3.0, and the maintained plugins below all declare `mirador ^4` peer dependencies.
- **React 19** (required by `mirador-dl-plugin` and `mirador-annotation-editor`).
- Hosting: Cloudflare Pages, custom domain `iiif.glosse.me`.

## Notes

- `docs/` is source-only planning (not deployed). The deployed site is the Vite build output (`dist/`).
- Repo is public, licensed MIT (`LICENSE`; the copyright notice must be kept, which gives credit). Met data is CC0, but credit the Met in the UI anyway.

## Open questions

(none right now)


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
- [ ] Export menu offering all three (user chooses):
  - [ ] Shareable link (`/?manifest=a&manifest=b…`)
  - [ ] Downloadable IIIF Collection JSON
  - [ ] Image collage (PNG), rendered client-side from manifest thumbnails/images (check CORS on source image servers; handle failures per item)
- [ ] "Add to collage" button on gallery cards

## Phase 4b: Searchable museum/library sources (IIIF-native)

Replaces the earlier Met-only plan. The Met API returns plain JPEGs with no IIIF manifests, so it is demoted to optional (see end). Verified live on 2026-11-09 (all send `Access-Control-Allow-Origin` for browser calls unless noted):

| Source | Search | IIIF manifest | Notes |
| --- | --- | --- | --- |
| [Art Institute of Chicago](https://api.artic.edu/docs) | `GET https://api.artic.edu/api/v1/artworks/search?q=…&limit=…&page=…` (paginated, `is_public_domain` filter) | `https://api.artic.edu/api/v1/artworks/{id}/manifest.json` (Presentation 2.x) | Data CC0 except `description` (CC-BY 4.0); images via IIIF Image API at `https://www.artic.edu/iiif/2`. Only presume reuse for works marked public domain/CC0. **Primary source.** |
| [Wellcome Collection](https://developers.wellcomecollection.org/docs/catalogue) | `GET https://api.wellcomecollection.org/catalogue/v2/works?query=…&pageSize=…&include=items` | `items[].locations[]` with `locationType` `iiif-presentation`, e.g. `https://iiif.wellcomecollection.org/presentation/v2/{id}` | Books, manuscripts, medical history. Licence is per item (`license` field); show it. Confirm reuse terms on their docs before launch. |
| [Internet Archive](https://archive.org/advancedsearch.php) | `advancedsearch.php?q=mediatype:image AND …&fl[]=identifier&output=json` | `https://iiif.archive.org/iiif/{identifier}/manifest.json` returned a redirect to a `collection.json` in testing, so the exact manifest URL pattern **needs more testing** | Huge and mixed rights; filter and display license. Phase it after AIC and Wellcome. |
| Library of Congress | `https://www.loc.gov/pictures/search/?q=…&fo=json` responded (200) | not yet checked | Slow response on first try; investigate later. |

Tasks:

- [ ] Provider interface: `search(query, filters, page) -> results[{id, title, creator, date, thumbnail, manifestUrl, license}]`
- [ ] AIC provider first (search → results grid → open `manifest.json` in Mirador)
- [ ] Wellcome provider (extract the IIIF manifest URL from each result; skip works without one)
- [ ] Internet Archive provider (after confirming the manifest URL pattern)
- [ ] Source picker + combined search across providers; filters: public domain only, has image
- [ ] Browse mode: department/classification (where the API offers it), highlights, random pick
- [ ] Result grid with thumbnails (IIIF Image API URLs, small size), pagination / infinite scroll
- [ ] Detail view: metadata, license/rights, link back to the source page
- [ ] "Open in viewer" and "Add to collage" on each result (feeds the collage section)
- [ ] Attribution line per source in the UI (e.g., "Data and images from the Art Institute of Chicago")
- [ ] Rate limiting / backoff, friendly errors, per-provider loading and failure states
- [ ] Decide: browser-only vs. Cloudflare Worker proxy/cache

Optional later: **The Met** (`/public/collection/v1.1/search`; the old `/v1/search` was retired 2026-10-01). No native IIIF, so manifests would have to be generated client-side from the JPEG URLs ([docs](https://metmuseum.github.io/)).

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
