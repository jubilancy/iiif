---
title: iiif.glosse.me chat archive index
date generated: 2026-11-27
tags: [index, iiif, glosse-me, archive]
info: Start here. Use it to find the note for the situation you are in. Written because the original chat was deleted; the code itself lives in the repo.
category: index
description: Overview and map of the notes that capture the chat where the iiif.glosse.me viewer, gallery, collage and item page were planned and built.
---

# iiif.glosse.me chat archive

The chat started with "what is this Smithsonian Mirador URL and how do I make an iiif.glosse.me" and ended with a merged repo ([jubilancy/iiif](https://github.com/jubilancy/iiif)): a Mirador 4 viewer, a CSV gallery, a collage maker, multi-source search, and a collections-style item page. It is **not deployed to Cloudflare yet**.

## Notes

| Note | Use it when |
| --- | --- |
| [[project-overview-and-decisions]] | You need the goals, the decisions and why they were made, routes, file layout |
| [[iiif-and-viewers-primer]] | You need to explain what a manifest is, what the Smithsonian/V&A/LoC URLs are, which viewers exist |
| [[setup-and-build]] | Installing, building, or fixing dependency conflicts |
| [[mirador-plugins]] | Adding, disabling or debugging Mirador plugins |
| [[search-providers]] | Adding or fixing a search source (V&A, AIC, Wellcome, Internet Archive, LoC, Met) |
| [[gallery-and-collage]] | Editing the CSV gallery or the collage/export features |
| [[item-page]] | Working on the `/item` page or the manifest reader |
| [[own-manifests]] | Publishing your own IIIF manifests |
| [[source-verification]] | You need to know which institutions' manifests were checked and what failed |
| [[cloudflare-deploy]] | Deploying to Cloudflare Pages and attaching `iiif.glosse.me` |
| [[testing-and-sandbox-notes]] | Testing in headless Chromium, debugging CORS/403s, bisecting plugins |
| [[git-and-pr-workflow]] | Branch/PR/merge commands that worked in the cloud session, hook warnings |
| [[working-preferences]] | Starting a new session and wanting the same working style |
| [[status-and-next-steps]] | You want to know what is done, unverified, and left to do |

## What was and was not readable when this archive was written

- Read: the full conversation of the session in which the archive was written, including tool results, file contents and the pasted IIIF Consortium member list.
- Not read: any other chat or session, any Claude project knowledge, and the screenshots and Playwright scripts I made in the session's scratchpad (they are gone; the technique is in [[testing-and-sandbox-notes]]).
- The repo contents were read directly from `main` at commit `c35afe1`.
