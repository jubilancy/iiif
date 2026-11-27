---
title: Project overview and decisions
date generated: 2026-11-27
tags: [project, decisions, iiif, mirador, architecture]
info: Read first when you come back to the project or need the reasoning behind a choice.
category: project
description: Goals of iiif.glosse.me, what was built, the decisions made with their reasons, the routes, and the repo layout.
---

# Project overview and decisions

Repo: [jubilancy/iiif](https://github.com/jubilancy/iiif) (public, MIT). Target site: `iiif.glosse.me` on Cloudflare Pages (not deployed yet, see [[cloudflare-deploy]]).

## What you asked for (in order)

1. Explain a Smithsonian Mirador URL and how to make `iiif.glosse.me` ([[iiif-and-viewers-primer]]).
2. A viewer built from a repo, with every Mirador plugin that exists ([[mirador-plugins]]).
3. A **gallery** for visitors who arrive without a manifest list, driven by a CSV of manifest URLs ("eliana's gallery" is your name for this) ([[gallery-and-collage]]).
4. A **collage**: paste manifest URLs, one per line, then export. All three export formats: shareable link, downloadable IIIF Collection JSON, PNG ([[gallery-and-collage]]).
5. A searchable interface over a museum API. You first named the Met, then said to use a better IIIF-native service if one exists ([[search-providers]]).
6. A collections-style item page like the V&A's, reading images straight from the source's IIIF image server ([[item-page]]).
7. A list of supported sources with an example manifest each ([[source-verification]]).
8. Merge the PRs and deploy to Cloudflare (merge done, deploy not, see [[cloudflare-deploy]]).

## Decisions and reasons

| Decision | Reason |
| --- | --- |
| npm + Vite build step, not a single `index.html` on a CDN | Mirador plugins need the ES module build; the UMD/CDN build does not support them ([mirador-integration README](https://github.com/ProjectMirador/mirador-integration)). A CSV gallery and routing are also easier with a build. |
| Mirador 4 (4.3.0), not Mirador 3 | First advice in the chat was to pin `mirador@^3`. That was outdated: npm `latest` is 4.3.0 and the maintained plugins declare `mirador ^4` peers. |
| React 19 | `mirador-dl-plugin` requires react `^19`; `mirador-annotation-editor` requires `>=19`. |
| `react-i18next@^15` | v17 conflicts with `mirador-image-tools` peer range (`^13 || ^14 || ^15`). See [[setup-and-build]]. |
| MIT licence, copyright "jubilancy" | You asked for free open source that gives credit. MIT requires keeping the copyright notice. I chose MIT and the holder name; you did not specify either. Met-style CC0 data still gets attribution in the UI. |
| Repo public | You said so. |
| `docs/` is planning only, not deployed | You said `TODO.md` "is just for you and me". The deployed site is `dist/`. |
| Dropped the Met as the main search source | The Met API returns plain JPEG URLs, not IIIF manifests. Art Institute of Chicago, V&A, Wellcome, Internet Archive publish manifests. |
| Browser-only (no Cloudflare Worker) for now | Verified: AIC, Wellcome, V&A, Met and IA APIs send CORS headers, so a proxy is not needed. A Worker is listed as an option for caching and annotation storage. |
| Collage kept in `localStorage` | No backend. Key is `iiif.collage.v1`. |
| `mirador-textoverlay` opt-in | It logged an error on Presentation 2.x manifests ([[mirador-plugins]]). |
| Hand-written 36-line router instead of a router library | Fewer dependencies; works with Cloudflare Pages' SPA fallback. |

## Routes

| Route | What it shows |
| --- | --- |
| `/` | Gallery. With `?manifest=URL` it opens the viewer instead. |
| `/viewer?manifest=URL` | Full Mirador (repeat `manifest=` to compare) |
| `/item?manifest=URL` or `/item/{provider}/{id}` | Item page ([[item-page]]) |
| `/search` | Multi-source search ([[search-providers]]) |
| `/collage` | Collage maker ([[gallery-and-collage]]) |
| `/embed?manifest=URL` | Chrome-less read-only viewer for iframes |

Query switches on viewer routes: `?disable=name,name`, `?enable=textoverlay`.

## Repo layout (main at `c35afe1`)

```text
README.md  LICENSE  package.json  vite.config.js  index.html  .gitignore
docs/            DEPLOY.md SOURCES.md TODO.md sources.json chat-archive/
public/          _headers gallery.csv manifests/sunday-on-la-grande-jatte.json
scripts/         make-manifest.mjs check-manifests.mjs
src/             App.jsx main.jsx plugins.js branding.jsx styles.css
src/components/  DeepZoom.jsx RichText.jsx
src/lib/         router.jsx csv.js manifest.js iiif.js collageStore.js useCollage.js exportPng.js
src/pages/       Viewer.jsx Gallery.jsx Search.jsx Collage.jsx Item.jsx
src/providers/   index.js vam.js artic.js wellcome.js archive.js
```

## Bug that slipped through once

The first viewer opened on Mirador's "add resource" catalog instead of the item because the config had `workspace: { isWorkspaceAddVisible: true }`. Fixed to `false`. My earlier check ("viewer mounts") did not catch it; check that a **window** opens, not just that Mirador renders.
