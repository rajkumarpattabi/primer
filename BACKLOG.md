# Primer — Backlog

Deferred features, kept out of v1 to keep it simple and reliable.

## 1. Live in-app AI Capture (deferred)
Type a term *inside the app* and have it explained automatically by an LLM.

- The plumbing is already built: `worker/` (a Cloudflare Worker that holds the
  API key and returns a structured concept) and `config.js` (`WORKER_URL`).
- It's dormant by design: while `WORKER_URL` is blank, the Capture box acts as a
  quick "find a concept" jump instead of calling an LLM.
- To enable later: deploy the Worker (see README "Step 2"), set `WORKER_URL`,
  and enter the `APP_KEY` pass-phrase in the app under **More**. No app code
  changes needed — the Capture box automatically switches to "Explain & save".
- Why deferred: no genuinely free, keyless option produces the structured
  learning format; and the git route (below) covers content refresh well.

## 2. Content workflow in use today (Path A + laptop)
New concepts are authored with Claude and delivered via git — not typed into
the app.

- **From mobile:** ask Claude (with a GitHub connector) to append the concept to
  `concepts.js` and commit it. GitHub Pages redeploys.
- **From laptop:** ask Claude for the concept, append it to `concepts.js`, then
  run `push.bat` (which pulls first, so it never overwrites a mobile commit).
- The app's **merge-on-update** ingests any new concepts on next open, dedupes
  by term, and preserves your review progress and streak.
- Convention: **append new concepts to the end** of the `concepts.js` array so
  the two routes touch different lines and git auto-merges cleanly.

## 3. Ideas for later
- Paste-import a concept JSON directly on the phone (Path B) — no git needed,
  but device-local only.
- Keyless "quick lookup" via the Wikipedia API as a lighter alternative to AI.
- Richer Map (tap-through graph), per-theme review sessions, daily review reminder.
