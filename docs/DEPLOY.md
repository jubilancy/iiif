# Deploying to Cloudflare Pages

Settings per the [Cloudflare Pages React guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/): production branch `main`, build command `npm run build`, build directory `dist`.

1. Cloudflare dashboard → Workers & Pages → Create application → Pages → Import an existing Git repository → `jubilancy/iiif`.
2. Use the settings above. Node 22 is what this repo was developed on; if the build uses an older npm you may see an engine warning from `mirador-textoverlay` (it asks for npm ≥ 11). It is a warning, not an error. Set `NODE_VERSION` in the Pages project's variables if you need to pin Node.
3. Project → Custom domains → Set up a domain → `iiif.glosse.me` ([docs](https://developers.cloudflare.com/pages/platform/custom-domains/)). If glosse.me's DNS is not on Cloudflare, add `CNAME iiif → <project>.pages.dev` at your DNS provider *after* adding the domain in the dashboard, otherwise you get a 522.

Notes:

- **SPA routing:** with no top-level `404.html`, Pages serves the app for unknown paths ([docs](https://developers.cloudflare.com/pages/configuration/serving-pages/)), so `/search`, `/collage`, `/viewer` and `/embed` work on refresh.
- **Headers:** `public/_headers` is copied into `dist/` and applies CORS to `/manifests/*` and long caching to hashed assets ([docs](https://developers.cloudflare.com/pages/configuration/headers/)).
- `docs/` is planning only and is not deployed.
