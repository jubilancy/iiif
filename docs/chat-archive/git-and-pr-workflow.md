---
title: Git and PR workflow
date generated: 2026-11-27
tags: [git, github, pull-requests, cloud-session, gh-cli]
info: Use when working on this repo from a Claude Code cloud session, or when a stop hook complains about unpushed commits.
category: how-to
description: The repo and PR history, the gh and git commands that worked in the cloud session (GraphQL is blocked), the squash-merge steps, and the fix for the unpushed-commit hook warning.
---

# Git and PR workflow

Repo: [jubilancy/iiif](https://github.com/jubilancy/iiif). Cloned shallow into `/home/user/iiif`:

```bash
git clone --depth 1 https://github.com/jubilancy/iiif /home/user/iiif
```

## History

| PR | Branch | Result |
| --- | --- | --- |
| [#1](https://github.com/jubilancy/iiif/pull/1) | `add-todo-plan` | `docs/TODO.md`, MIT `LICENSE`, plan. Closed unmerged: its commits were squashed into #2's merge. |
| [#2](https://github.com/jubilancy/iiif/pull/2) | `build-viewer` | Viewer, plugins, gallery, collage, search, own-manifest script, docs. Squash-merged as `b7e6117`. |
| [#3](https://github.com/jubilancy/iiif/pull/3) | `item-page` | Item page, V&A provider, viewer fix, `SOURCES.md`, check script. Squash-merged as `c35afe1`. |
| later | `docs-archive` | This archive and the gallery CSV quoting fix (see [[status-and-next-steps]]). |

Branches were created from the default branch `main` (never commit directly to it). Commits end with the attribution trailers the session was configured to add (`Co-Authored-By:` and a `Claude-Session:` link); PR bodies end with a `Generated with Claude Code` line.

## Commands that worked

`gh pr create` failed: **GraphQL is blocked** in cloud sessions ("GitHub GraphQL is not available from Claude Code sessions"). Use the REST API:

```bash
# create a draft PR
gh api repos/jubilancy/iiif/pulls -f title="TITLE" -f head=BRANCH -f base=main -F draft=true -f body="BODY" --jq .html_url

# mark ready for review (the CCR route; replace N)
gh api -X POST repos/jubilancy/iiif/pulls/N/ccr/ready_for_review

# squash merge
gh api -X PUT repos/jubilancy/iiif/pulls/N/merge -f merge_method=squash -f commit_title="TITLE" --jq '.merged,.message'

# close a PR and comment
gh api -X PATCH repos/jubilancy/iiif/pulls/N -f state=closed --jq .state
gh api -X POST repos/jubilancy/iiif/issues/N/comments -f body="Closing: …" --jq .html_url

# state, checks, comments
gh api repos/jubilancy/iiif/pulls/N --jq '{state,mergeable,mergeable_state}'
gh api repos/jubilancy/iiif/commits/BRANCH/check-runs --jq '.total_count'
```

Push with `git push -u origin BRANCH`. The repo has no CI configured (0 check runs on every PR), so "green" meant nothing to wait for.

## Stop-hook warning: "Branch has N unpushed commit(s) and no remote branch"

It appeared twice even though `git ls-remote --heads origin BRANCH` showed the branch already on the remote at the same commit. Cause: the shallow clone tracks only `main`, so `refs/remotes/origin/BRANCH` was missing locally. Fix:

```bash
git fetch origin BRANCH:refs/remotes/origin/BRANCH
git branch --set-upstream-to=origin/BRANCH BRANCH   # fails until the fetch above has run
```

Run the fetch after every push on a new branch.

## Merge notes

- You asked for each merge explicitly ("merge the PR"). Squash was my choice; you did not specify a method.
- The session was auto-subscribed to PR events; the notifications only reported creation, ready-for-review, merge and close. Nothing required action.
- Merging a squash does not mark earlier PRs that contained the same commits as merged, so #1 had to be closed by hand.
