---
title: Testing and sandbox notes
date generated: 2026-11-27
tags: [testing, playwright, cors, sandbox, debugging]
info: Use when you test the app in headless Chromium from a cloud session, or see a CORS error that is really a 403.
category: how-to
description: How the app was tested in headless Chromium behind the session proxy, what blocked tests (user-agent 403s), the plugin bisect technique, and what not to do.
---

# Testing and sandbox notes

## Run the built app

```bash
npm run build
npx vite preview --port 4173
```

## Playwright behind the session proxy

Chromium and Playwright were preinstalled (`require('playwright')` works; run with `NODE_PATH=$(npm root -g)`). The session routes HTTPS through `$HTTPS_PROXY`. **Bypass the proxy for localhost** or every page shows an "agent-proxy relay … only accepts HTTPS CONNECT" message.

```js
const { chromium } = require('playwright');
const browser = await chromium.launch({
  proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' },
});
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto('http://localhost:4173/item/vam/O1155200', { waitUntil: 'load' });
await page.waitForTimeout(7000);
await page.screenshot({ path: 'shot.png' });
```

Proxy status and recent failures: `curl -sS "$HTTPS_PROXY/__agentproxy/status"`. Do not disable TLS verification or unset `HTTPS_PROXY`.

## The 403 that looks like CORS

- Browser console: `Access to fetch at 'https://…' … No 'Access-Control-Allow-Origin' header` plus `net::ERR_FAILED`, and Mirador showing "The resource cannot be added".
- Cause: some servers return **403 with no CORS headers to the `HeadlessChrome` user agent**. Confirmed with curl for: Art Institute of Chicago API (403 vs 200 with a normal Chrome UA), Wellcome image server `info.json` (manifest itself was fine), Library of Congress manifests, and Smithsonian manifests in the browser run.
- Accepted the headless browser: V&A (API, manifest, images), Internet Archive, Wellcome manifest and search (the Met was only checked with curl and a default user agent).
- I **did not spoof a user agent**. When I tried to rerun the test with a normal Chrome UA, the session's safety classifier denied it, and I treated that as correct: it would sidestep a site's bot blocking. Test those sources in your own browser instead, or test the logic outside the browser (Node `fetch`, `scripts/check-manifests.mjs`).
- Provider logic was checked in Node by importing the provider module directly (for example `import prov from './src/providers/artic.js'`, then `prov.search({ q: 'water lilies', page: 1, publicOnly: true })`).

## Bisecting a plugin problem

Use the `?disable=` switch ([[mirador-plugins]]): load the same manifest once with all plugins, once with all disabled, then once per plugin, and count the console error. That isolated `mirador-textoverlay` as the source of `Fetch API cannot load dctypes:Image`. A dialog "TypeError: Failed to fetch" that remained was the Wellcome image `info.json` 403, not a plugin.

## What was verified in a browser

- Viewer shell with all plugins and branding mounts; a window opens after the `isWorkspaceAddVisible` fix.
- Gallery loaded 4 cards (before the fifth, own-manifest row was added); search returned 24 cards for Wellcome, Internet Archive and V&A; collage add/validate/export (link, JSON, PNG); theme toggle; `/embed` has no top bar; deep links like `/search?q=…` work on refresh.
- Item page with the V&A manifest end to end ([[item-page]]).
- Screenshots and test scripts were saved in the session scratchpad and are gone.

## Not verified in a browser

AIC, Smithsonian, Wellcome image tiles, Library of Congress, and all other institutions ([[source-verification]]).
