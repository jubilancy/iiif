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
import { brandingPlugin } from './branding.jsx';

export { annotationAdapters };

const flat = (...ps) => ps.flatMap((p) => (Array.isArray(p) ? p : [p]));

// Named groups so a misbehaving plugin can be switched off with `?disable=name,name`
// (handy for debugging and for embeds that want a lighter viewer).
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
  // canvasnavigation replaces a built-in component, so it goes last.
  canvasnavigation: flat(canvasNavigationPlugin),
};

export const pluginNames = Object.keys(GROUPS);

// Opt-in plugins are off unless requested with `?enable=name`.
// textoverlay: on Presentation 2.x manifests it logged `Fetch API cannot load dctypes:Image`
// (traced by bisecting plugins), so it stays opt-in until verified in a real browser.
export const optInPlugins = ['textoverlay'];

export function buildPlugins({ embed = false, disable = [], enable = [] } = {}) {
  const off = new Set([...disable, ...optInPlugins.filter((n) => !enable.includes(n))]);
  const base = pluginNames.filter((n) => !off.has(n)).flatMap((n) => GROUPS[n]);
  return embed || off.has('branding') ? base : [...base, brandingPlugin];
}
