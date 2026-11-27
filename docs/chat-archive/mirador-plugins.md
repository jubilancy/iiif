---
title: Mirador plugins
date generated: 2026-11-27
tags: [mirador, plugins, annotations, debugging]
info: Use when adding a plugin, turning one off, or debugging a plugin conflict or error.
category: reference
description: Which Mirador 4 plugins are installed and why, their peer dependencies, which were skipped, how plugins are wired, the opt-in/disable switches, and the Mirador config used.
---

# Mirador plugins

How plugins work ([Mirador plugin wiki](https://github.com/ProjectMirador/mirador/wiki/Mirador-3-plugins)): a plugin targets an existing component and either `add`s content to it or `wrap`s it; it can connect to state. Plugins only work with the ES module build, not the UMD/CDN build.

## Installed (all declare Mirador 4 support, versions from the npm registry on 2026-11-09)

| Package | Version | Peers noted | Purpose |
| --- | --- | --- | --- |
| `mirador-image-tools` | 1.0.2 | react ^18\|\|^19, mirador ^4, mui ^7\|\|^9 | image adjustments |
| `mirador-share-plugin` | 1.0.2 | adds `@mui/icons-material` | share dialog |
| `mirador-dl-plugin` | 1.1.2 | react ^19 | download |
| `mirador-annotation-editor` | 1.4.1 | react >=19, mirador ^4.2.3, mui >=5 | create annotations |
| `mirador-textoverlay` | 1.1.1 | mirador 4.x, engines npm>=11 | selectable OCR text (opt-in) |
| `mirador-canvaslink` | 1.0.5 | | share canvas link |
| `mirador-downloaddialog` | 1.0.10 | | download dialog |
| `mirador-imagecropper` | 1.0.4 | | image URL for a selected area |
| `mirador-keyboardshortcuts` | 1.0.3 | | keyboard shortcuts |
| `mirador-canvasnavigation` | 1.0.11 | | replaces built-in canvas navigation |

## Skipped on purpose

- `mirador-annotations` 0.5.0: Mirador 3 only (peer `mirador ^3`, `@material-ui` 4). Use `mirador-annotation-editor`.
- `@harvard-lts/*` (analytics, help, login, eda, pdf, harvard-custom, hide-nav, url-sync, annotations-auth, canvaslink): built for Harvard's viewer.
- `mirador-jump-to-page`: last published 2017.
- Also seen, not evaluated: `dbf-mirador`, `dbf-mirador-annotation-editor`.

## Import forms (verified from each package's exports)

```js
import { miradorImageToolsPlugin } from 'mirador-image-tools';
import { miradorSharePlugin, miradorShareDialogPlugin } from 'mirador-share-plugin';
import { miradorDownloadPlugin, miradorDownloadDialogPlugin } from 'mirador-dl-plugin';
import annotationPlugins, { annotationAdapters } from 'mirador-annotation-editor';
import textOverlayPlugin from 'mirador-textoverlay';
import canvasLinkPlugin from 'mirador-canvaslink';
import downloadDialogPlugin from 'mirador-downloaddialog';
import imageCropperPlugin from 'mirador-imagecropper';
import keyboardShortcutsPlugin from 'mirador-keyboardshortcuts';
import canvasNavigationPlugin from 'mirador-canvasnavigation';
```

`annotationAdapters` contains `LocalStorageAdapter` and `AiiinotateAdapter`. Annotation CSS: `import 'mirador-annotation-editor/dist/index.css';`.

## Wiring (`src/plugins.js`)

```js
const flat = (...ps) => ps.flatMap((p) => (Array.isArray(p) ? p : [p]));

const GROUPS = {
  imagetools: flat(miradorImageToolsPlugin),
  share: flat(miradorSharePlugin, miradorShareDialogPlugin),
  download: flat(miradorDownloadPlugin, miradorDownloadDialogPlugin),
  downloaddialog: flat(downloadDialogPlugin),
  canvaslink: flat(canvasLinkPlugin),
  cropper: flat(imageCropperPlugin),
  textoverlay: flat(textOverlayPlugin),
  shortcuts: flat(keyboardShortcutsPlugin),
  annotations: flat(annotationPlugins),
  canvasnavigation: flat(canvasNavigationPlugin), // replaces a built-in, keep last
};

export const optInPlugins = ['textoverlay'];

export function buildPlugins({ embed = false, disable = [], enable = [] } = {}) {
  const off = new Set([...disable, ...optInPlugins.filter((n) => !enable.includes(n))]);
  const base = pluginNames.filter((n) => !off.has(n)).flatMap((n) => GROUPS[n]);
  return embed || off.has('branding') ? base : [...base, brandingPlugin];
}
```

Branding (`src/branding.jsx`) is a `wrap` plugin on the `Branding` target that replaces Mirador's logo with a small "IIIF" link to `/`.

## Switches

- `?disable=imagetools,share,download,downloaddialog,canvaslink,cropper,textoverlay,shortcuts,annotations,canvasnavigation,branding`
- `?enable=textoverlay`

## Mirador config in use (`src/pages/Viewer.jsx`)

```js
Mirador.viewer({
  id: 'mirador',
  selectedTheme: theme,            // 'light' | 'dark'
  windows: manifests.map((manifestId) => ({ manifestId })),
  window: { sideBarOpenByDefault: false, imageToolsEnabled: true },
  workspaceControlPanel: { enabled: !embed },
  workspace: { isWorkspaceAddVisible: false },
  annotation: {
    adapter: (canvasId) => new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`, 'Anonymous'),
    exportLocalStorageAnnotations: true,
    readonly: embed,
  },
  textOverlay: { enabled: true, selectable: true, visible: false },
}, buildPlugins({ embed, disable, enable }));
```

Unmount with `viewer.unmount()` (exists in Mirador 4; the app remounts when manifests, theme or switches change).

## Known issues and unverified points

- **textoverlay:** on Presentation 2.x manifests (Wellcome, V&A) the console logged `Fetch API cannot load dctypes:Image. URL scheme "dctypes" is not supported.` Found by loading the same manifest with `?disable=` for each plugin: the error disappeared only when `textoverlay` was disabled. Whether it also breaks anything visible was not determined. Check it on a real OCR manifest in a normal browser before enabling by default.
- `dl-plugin` and `downloaddialog` both add download UI; `canvasnavigation` replaces a built-in. In the item page screenshot the toolbar showed download, share, crop, image tools and page navigation without visible clashes, but this was not tested thoroughly.
- Annotation storage is per browser only (`LocalStorageAdapter`). Sharing needs a server (see [[status-and-next-steps]]).
- Pitfall: `isWorkspaceAddVisible: true` opens the "add resource" catalog at start ([[project-overview-and-decisions]]).
