---
title: Working preferences
date generated: 2026-11-27
tags: [preferences, workflow, claude-code, style]
info: Paste or summarise this at the start of a new session so it works the way this one did.
category: reference
description: The user preferences configured for the session and the working agreements that emerged in the chat.
---

# Working preferences

Source: the preferences configured for the session (not stated in the chat messages) plus agreements that emerged in the chat.

## Configured preferences

- Uses Claude in the browser and the Claude app only. Do not assume access to the local machine, home directory or local files. Give settings paths for the web app, not instructions to edit local config files.
- Concise replies. Report only what changed or needs a decision. No restating CI status, no "waiting on you" notes.
- Python: use `uv` (`uv run`, `uv add`, `uv pip install`). Never give `python3` or `pip` commands. (No Python was needed in this project; `python3 -I` was used only for throwaway checks inside the sandbox.)
- Verify, never write from memory: confirm facts, links, repo names, versions, descriptions and lists with live tools before putting them in a file, PR or answer. For link lists, confirm each link resolves, the project is not archived or dead, and the description matches the page. If something cannot be verified, leave it out and say so. If a tool is blocked, say so instead of falling back to memory.
- Citations as markdown links `[Title](https://example.com)`, never HTML. Hyperlink every website mentioned.
- Use markdown for lists, tables and simple displays unless interactivity is asked for.
- Run searches and lookups silently, then give the final answer.

## Agreements from the chat

- "Continue to the next phase without asking me" applied to Phases 1 to 7. Merging and deploying were separate explicit asks.
- Do not push around a refused action: the credential request for Cloudflare was declined and not repeated; the user-agent spoof was denied and not repeated.
- When a decision is made (collage exports all three, MIT, repo public, `docs/` not deployed), do not ask it again.
- Say plainly what could not be verified (the open list is in [[status-and-next-steps]] and [[source-verification]]).
- The user's email address was available as session context and is deliberately not recorded here.
