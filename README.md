# iiif.glosse.me

A IIIF viewer, gallery and collage maker built on [Mirador 4](https://github.com/ProjectMirador/mirador).

- **Viewer** (`/viewer?manifest=URL`, repeat `manifest=` to compare). Mirador 4 with image tools, share, download, annotation editor, canvas navigation, keyboard shortcuts, image cropper and canvas link plugins.
- **Gallery** (`/`): items from `public/gallery.csv`. The default page for visitors who have no manifest list.
- **Search** (`/search`): search the Art Institute of Chicago, Wellcome Collection and the Internet Archive (all publish IIIF manifests), with a public-domain/open filter.
- **Collage** (`/collage`): paste manifest URLs, one per line, then export a shareable link, a IIIF Collection JSON, or a PNG collage.
- **Embed** (`/embed?manifest=URL`): chrome-less viewer for iframes.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

Plugin switches (query string): `?disable=share,cropper` turns plugins off; `?enable=textoverlay` turns the opt-in text overlay on. Names are listed in `src/plugins.js`.

## Add your own manifests

```bash
node scripts/make-manifest.mjs --name my-item --label "My item" \
  --rights https://creativecommons.org/publicdomain/zero/1.0/ \
  https://example.org/iiif/2/some-image/info.json
```

This writes `public/manifests/my-item.json`. Add a row to `public/gallery.csv` (`manifest_url,title,thumbnail,collection,notes`) to list it in the gallery. Deployment notes are in [docs/DEPLOY.md](docs/DEPLOY.md); the plan and status are in [docs/TODO.md](docs/TODO.md).

## Credits and licence

MIT licensed (see `LICENSE`); keep the copyright notice when reusing. Built on Mirador and its plugins (see `package.json`). Collection data and images come from their institutions under each source's own terms; the app shows attribution and rights next to every result.
