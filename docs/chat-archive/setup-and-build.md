---
title: Setup and build
date generated: 2026-11-27
tags: [setup, npm, vite, dependencies, react-19]
info: Use when installing from scratch, upgrading dependencies, or hitting an npm ERESOLVE error.
category: how-to
description: Commands, exact dependency versions, config files and the dependency pitfalls hit while scaffolding the Vite + Mirador 4 app.
---

# Setup and build

Developed on Node `v22.23.4`, npm `10.9.9`.

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # serve dist/ (used on port 4173 for testing)
npx vite preview --port 4173
```

## Dependencies as installed (package.json at `c35afe1`)

```json
{
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/icons-material": "^9.5.0",
    "@mui/material": "^9.5.0",
    "@mui/system": "^9.5.0",
    "mirador": "^4.3.0",
    "mirador-annotation-editor": "^1.4.1",
    "mirador-canvaslink": "^1.0.5",
    "mirador-canvasnavigation": "^1.0.11",
    "mirador-dl-plugin": "^1.1.2",
    "mirador-downloaddialog": "^1.0.10",
    "mirador-image-tools": "^1.0.2",
    "mirador-imagecropper": "^1.0.4",
    "mirador-keyboardshortcuts": "^1.0.3",
    "mirador-share-plugin": "^1.0.2",
    "mirador-textoverlay": "^1.1.1",
    "openseadragon": "^6.1.1",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "react-i18next": "^15.7.4"
  },
  "devDependencies": { "@vitejs/plugin-react": "^6.3.0", "vite": "^8.3.7" }
}
```

`package.json` also has `"type": "module"` and `"license": "MIT"`.

Mirador 4.3.0 peer dependencies (from the npm registry): `react ^18 || ^19`, `react-dom` same, `@mui/system ^9.x`, `@mui/material ^9.x`, `react-i18next ^13 || ^14 || ^15 || ^17`, `@emotion/react ^11.10.6`, `@emotion/styled ^11.10.6`.

## Install command that worked

```bash
npm i react@^19 react-dom@^19 mirador@^4 @mui/material@^9 @mui/system@^9 @mui/icons-material@^9 @emotion/react @emotion/styled react-i18next@^15 mirador-image-tools@1.0.2 mirador-share-plugin@1.0.2 mirador-dl-plugin@1.1.2 mirador-annotation-editor@1.4.1 mirador-textoverlay@1.1.1 mirador-canvaslink@1.0.5 mirador-downloaddialog@1.0.10 mirador-imagecropper@1.0.4 mirador-keyboardshortcuts@1.0.3 mirador-canvasnavigation@1.0.11
npm i openseadragon@^6
npm i -D vite @vitejs/plugin-react
```

## `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 4000 },
});
```

`.gitignore`: `node_modules`, `dist`, `.wrangler`, `.DS_Store`, `*.log`.

## Pitfalls

- **`react-i18next@^17` → ERESOLVE.** `mirador-image-tools` peers allow `^13 || ^14 || ^15`. Use `^15`.
- **`mirador-textoverlay@*` resolved to 0.3.8** (a Mirador 3 build needing `@material-ui/core@4` and react ≤17) and broke the install. Pin explicit latest versions (`1.1.1`), as above. Get each latest with `npm view <pkg> version`.
- **Engine warning:** `mirador-textoverlay@1.1.1` declares `npm >= 11`. With npm 10.9.9 it only warns. A Cloudflare build may show the same warning ([[cloudflare-deploy]]).
- Build prints a chunk size warning (the bundle is about 3.7 MB, 1.07 MB gzipped, because of Mirador). The config raises the limit; it is not an error.
- 14 low-severity `npm audit` findings were reported at install time and not addressed.
