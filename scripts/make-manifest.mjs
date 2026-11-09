#!/usr/bin/env node
// Build a IIIF Presentation 3.0 manifest from one or more IIIF Image API info.json URLs.
//
//   node scripts/make-manifest.mjs --name my-item --label "My item" \
//     [--summary "..."] [--rights https://creativecommons.org/publicdomain/zero/1.0/] \
//     [--attribution "Credit line"] [--base https://iiif.glosse.me] \
//     <info.json URL> [<info.json URL> ...]
//
// Writes public/manifests/<name>.json (served at <base>/manifests/<name>.json).
import { mkdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values: o, positionals: infos } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: 'string' },
    label: { type: 'string' },
    summary: { type: 'string' },
    rights: { type: 'string' },
    attribution: { type: 'string' },
    base: { type: 'string', default: 'https://iiif.glosse.me' },
  },
});

if (!o.name || !o.label || !infos.length) {
  console.error('Usage: make-manifest.mjs --name <slug> --label <title> [options] <info.json> [...]');
  process.exit(1);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(o.name)) {
  console.error('--name must be a lowercase slug (a-z, 0-9, hyphens).');
  process.exit(1);
}

const manifestId = `${o.base}/manifests/${o.name}.json`;
const items = [];

for (const [i, url] of infos.entries()) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const info = await res.json();
  const svcId = info['@id'] || info.id;
  const v3 = Boolean(info.id) && String(info['@context'] || '').includes('/image/3/');
  const { width, height } = info;
  if (!svcId || !width || !height) throw new Error(`${url}: missing id/width/height`);
  const n = i + 1;
  const canvasId = `${manifestId}/canvas/${n}`;
  const profile = Array.isArray(info.profile) ? info.profile[0] : info.profile;
  items.push({
    id: canvasId,
    type: 'Canvas',
    label: { none: [`Image ${n}`] },
    width,
    height,
    thumbnail: [{ id: `${svcId}/full/!300,300/0/default.jpg`, type: 'Image', format: 'image/jpeg' }],
    items: [{
      id: `${canvasId}/page`,
      type: 'AnnotationPage',
      items: [{
        id: `${canvasId}/page/image`,
        type: 'Annotation',
        motivation: 'painting',
        target: canvasId,
        body: {
          id: v3 ? `${svcId}/full/max/0/default.jpg` : `${svcId}/full/full/0/default.jpg`,
          type: 'Image',
          format: 'image/jpeg',
          width,
          height,
          service: [v3
            ? { id: svcId, type: 'ImageService3', profile: info.profile || 'level1' }
            : { '@id': svcId, '@type': 'ImageService2', profile: profile || 'http://iiif.io/api/image/2/level1.json' }],
        },
      }],
    }],
  });
}

const manifest = {
  '@context': 'http://iiif.io/api/presentation/3/context.json',
  id: manifestId,
  type: 'Manifest',
  label: { en: [o.label] },
  ...(o.summary ? { summary: { en: [o.summary] } } : {}),
  ...(o.rights ? { rights: o.rights } : {}),
  ...(o.attribution ? { requiredStatement: { label: { en: ['Attribution'] }, value: { en: [o.attribution] } } } : {}),
  thumbnail: [items[0].thumbnail[0]],
  items,
};

mkdirSync('public/manifests', { recursive: true });
const out = `public/manifests/${o.name}.json`;
writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${out} (${items.length} canvas${items.length === 1 ? '' : 'es'})`);
console.log(`Public URL: ${manifestId}`);
