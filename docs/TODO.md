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


## Status (update as you go)

Legend: [x] done and checked here; [~] built but not fully verified (reason given); [ ] not done.

## Phase 1: Scaffold

- [x] Vite + React 19 + Mirador 4 project (`npm run dev` / `npm run build` work)
- [x] Viewer reads `?manifest=` (multiple allowed); theme (light/dark) passed to Mirador
- [x] Dependencies installed with peers satisfied (`react-i18next@15`: v17 conflicts with `mirador-image-tools`)

## Phase 2: Cloudflare deploy

- [x] `public/_headers` (CORS for `/manifests/*`, caching) and SPA fallback confirmed from Cloudflare docs; see `docs/DEPLOY.md`
- [ ] **Manual (needs your Cloudflare account):** create the Pages project, set build to `npm run build` / `dist`, add custom domain `iiif.glosse.me`

## Phase 3: Plugins

- [x] Loaded: image-tools, share, dl-plugin, downloaddialog, canvaslink, imagecropper, keyboardshortcuts, annotation-editor, canvasnavigation, plus glosse.me branding. The viewer mounts with all of them (checked in headless Chromium).
- [~] `mirador-textoverlay`: **opt-in** (`?enable=textoverlay`). Bisecting showed it logs `Fetch API cannot load dctypes:Image` on Presentation 2.x manifests. Needs a check on a real OCR manifest in a normal browser before enabling by default.
- [~] Overlap/conflicts: `dl-plugin` and `downloaddialog` both add download UI; `canvasnavigation` replaces a built-in. Needs a look in a real browser; use `?disable=` to isolate.
- Skipped on purpose: `mirador-annotations` (Mirador 3 only), `@harvard-lts/*` (Harvard-specific), `mirador-jump-to-page` (2017).

## Phase 4: Gallery, collage

- [x] Gallery from `public/gallery.csv`; missing titles/thumbnails are filled from the manifest; bad manifests don't break the page
- [x] Landing page (`/` with no `?manifest=`) shows the gallery; filter by text and collection
- [x] Collage: paste URLs one per line, per-line validation (bad lines stay in the box), reorder/remove
- [x] Export: shareable link, IIIF Collection JSON, PNG (all three tested in headless Chromium; PNG shows a placeholder for images that fail to load)
- [x] "Add to collage" from gallery and search results; collage kept in localStorage

## Phase 4b: Search sources

- [x] Art Institute of Chicago (primary). Uses the Elasticsearch DSL because plain `q` only re-ranks and never filters (checked); filters exact public domain
- [x] Wellcome Collection (IIIF manifest from each result; licence shown)
- [x] Internet Archive (manifest `https://iiif.archive.org/iiif/{id}/manifest.json`; some items are slow or return 500)
- [x] Source picker, "All sources" (results interleaved), public-domain filter, pagination, random page, attribution and rights on every result
- [~] **Not verified in a browser from this sandbox:** AIC, Smithsonian and Wellcome *image* servers answer 403 to the `HeadlessChrome` user agent (confirmed with curl), so in-browser image tiles for those could not be tested here. They return 200 for normal user agents; please open a few items in your own browser.
- [ ] Library of Congress provider (search responded; manifests not checked)
- [ ] Optional: The Met (no native IIIF; would need generated manifests)
- [ ] Decide: stay browser-only, or add a Cloudflare Worker cache/proxy

## Phase 5: Own manifests

- [x] `public/manifests/` served as static JSON with CORS (`_headers`)
- [x] `scripts/make-manifest.mjs` builds a Presentation 3.0 manifest from IIIF Image API `info.json` URLs; example: `sunday-on-la-grande-jatte.json` (AIC public-domain image). Loads in Mirador locally. Not run through the official IIIF validator.
- [x] Documented in README
- [ ] Image hosting (needs an IIIF Image API server; out of scope for static Pages)

## Phase 6: Viewer polish

- [x] Light/dark theme (saved in localStorage), also applied to Mirador
- [x] Shareable link (collage page + share plugin)
- [x] `/embed` route (no site chrome, no workspace controls, read-only annotations)
- [x] glosse.me branding via a `Branding` wrap plugin
- [ ] URL-bar manifest input on the viewer page (today: Mirador's own "Add resource" button, or the collage page)

## Phase 7: Annotations

- [x] Annotation editor loaded with its `LocalStorageAdapter` (per-browser, per-canvas, with export)
- [ ] Server storage (needs a backend, e.g. Cloudflare Workers + KV/D1, or an annotation server such as Aiiinotate) so annotations can be shared

## Docs

- [x] README, `docs/DEPLOY.md`
- [ ] Add screenshots after the first deploy
