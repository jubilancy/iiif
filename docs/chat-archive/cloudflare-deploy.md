---
title: Cloudflare deploy
date generated: 2026-11-27
tags: [cloudflare, pages, deploy, dns, headers]
info: Use when you are ready to put iiif.glosse.me online. Deployment was NOT done in the chat.
category: how-to
description: Cloudflare Pages settings, custom-domain and DNS steps, headers and SPA behaviour for this app, and why the deploy was left to you.
---

# Cloudflare deploy

**Status: not deployed.** You asked me to deploy. This session had no Cloudflare credentials. I asked for an API token through the secure credential form (host `api.cloudflare.com`); you declined, so I did not ask again. Do the dashboard steps below yourself.

## Settings (per the [Cloudflare Pages React guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/))

| Setting | Value |
| --- | --- |
| Repository | `jubilancy/iiif` |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist` |

## Steps

1. Cloudflare dashboard → Workers & Pages → Create application → Pages → Import an existing Git repository → pick `jubilancy/iiif`.
2. Enter the settings above. If the build fails on Node, add the environment variable `NODE_VERSION=22` (the app was built on Node 22; setting it is my suggestion, not tested on Cloudflare). A `mirador-textoverlay` engine warning (`npm >= 11`) is only a warning ([[setup-and-build]]).
3. After the first deploy: project → Custom domains → Set up a domain → `iiif.glosse.me` ([docs](https://developers.cloudflare.com/pages/platform/custom-domains/)).
4. If glosse.me's DNS is **not** on Cloudflare, add this at your DNS provider (only after step 3, otherwise you get a 522):

```text
CNAME  iiif  →  <your-project>.pages.dev
```

   A subdomain does not need to be a Cloudflare zone. An apex domain would.
5. Open a few items (V&A, Art Institute, Wellcome) in your own browser. Those servers could not be tested from the sandbox ([[testing-and-sandbox-notes]]).

## Behaviour already handled

- **SPA routes:** with no top-level `404.html`, Pages serves the app for unknown paths ([docs](https://developers.cloudflare.com/pages/configuration/serving-pages/)), so `/search`, `/collage`, `/viewer`, `/item`, `/embed` work on refresh. Do not add a `404.html`.
- **Headers:** `public/_headers` is copied to `dist/` and applied by Pages ([docs](https://developers.cloudflare.com/pages/configuration/headers/)):

```text
/manifests/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Content-Type: application/ld+json; charset=utf-8
  Cache-Control: public, max-age=300

/gallery.csv
  Cache-Control: public, max-age=300

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

- `vite preview` does not apply `_headers`, so CORS on `/manifests/*` can only be checked after deploy.
- `docs/` is not part of the build output, so it is not served.

## If you want me to deploy next time

- Credentials: I would need a Cloudflare API token. I requested it as a bearer token for `api.cloudflare.com`. Scopes I would have asked for: Pages edit on the account, plus DNS edit if glosse.me is on Cloudflare. **This scope list is my suggestion and was not checked against Cloudflare's docs.**
- `api.cloudflare.com` was reachable from the session (HTTP 400 without a token).
- The Cloudflare connector available in the session (`Cloudflare_Developer_Platform`) exposed only Workers bindings tools (D1, KV, R2, Hyperdrive, Workers listing, docs search) and was marked deprecated in favour of `https://mcp.cloudflare.com/mcp`. It had no Pages deploy tool. It was not used.
