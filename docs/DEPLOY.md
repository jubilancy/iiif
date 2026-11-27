# Deploying

Two routes. The repo ships a GitHub Pages workflow (`.github/workflows/deploy.yml`); the Cloudflare Pages steps remain below as an alternative.

## GitHub Pages at `iiif.glosse.me` (workflow in the repo)

The workflow runs on every push to `main` (and manually from the Actions tab): `npm ci`, `npm run build`, copies `dist/index.html` to `dist/404.html` (GitHub Pages has no SPA fallback, so unknown paths serve the app), then uploads `dist/` and deploys it ([GitHub docs](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)). These settings cannot be changed from a Claude Code session; do them in the repo on github.com:

1. Settings → Pages → Build and deployment → Source: **GitHub Actions** (replaces "Deploy from a branch", which is what currently publishes the raw, unbuilt repo).
2. Settings → Pages → Custom domain: `iiif.glosse.me` → Save. With a workflow-based deploy no `CNAME` file is created or needed ([docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)).
3. At your DNS provider, create the record **after** step 2 (GitHub recommends this order to avoid domain takeover):

```text
CNAME  iiif  →  jubilancy.github.io
```

   Point it at `<username>.github.io` without the repository name, not at the `*.pages.github.io` address shown in the settings. GitHub also recommends [verifying the domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages) first.
4. Actions → "Deploy to GitHub Pages" → Run workflow (or push to `main`) so a deployment happens after step 1.
5. When the certificate is ready (can take a while), tick **Enforce HTTPS**.

Notes:

- Your account's user site already uses the custom domain `notes.glosse.me`, which is why `jubilancy.github.io/iiif/` redirects there. Giving this repo its own custom domain serves it at `iiif.glosse.me` instead.
- CORS for `/manifests/*`: a manifest file on the current branch-based Pages site was served with `Access-Control-Allow-Origin: *` (checked 2026-11-27), so other viewers can load your manifests. Re-check after the switch.
- `public/_headers` is a Cloudflare Pages file; GitHub Pages ignores it (it is copied into `dist/` but has no effect).
- The `docs/` folder is not part of `dist/`, so the planning docs are no longer published once the source is GitHub Actions.

## Cloudflare Pages (alternative)

Settings per the [Cloudflare Pages React guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/): production branch `main`, build command `npm run build`, build directory `dist`.

1. Cloudflare dashboard → Workers & Pages → Create application → Pages → Import an existing Git repository → `jubilancy/iiif`.
2. Use the settings above. Node 22 is what this repo was developed on; if the build uses an older npm you may see an engine warning from `mirador-textoverlay` (it asks for npm ≥ 11). It is a warning, not an error. Set `NODE_VERSION` in the Pages project's variables if you need to pin Node.
3. Project → Custom domains → Set up a domain → `iiif.glosse.me` ([docs](https://developers.cloudflare.com/pages/platform/custom-domains/)). If glosse.me's DNS is not on Cloudflare, add `CNAME iiif → <project>.pages.dev` at your DNS provider *after* adding the domain in the dashboard, otherwise you get a 522.

Notes:

- **SPA routing:** with no top-level `404.html`, Pages serves the app for unknown paths ([docs](https://developers.cloudflare.com/pages/configuration/serving-pages/)), so `/search`, `/collage`, `/viewer` and `/embed` work on refresh.
- **Headers:** `public/_headers` is copied into `dist/` and applies CORS to `/manifests/*` and long caching to hashed assets ([docs](https://developers.cloudflare.com/pages/configuration/headers/)).
- `docs/` is planning only and is not deployed.
