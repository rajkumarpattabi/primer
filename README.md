# Primer — Web App (PWA)

A private, installable learning companion that turns any tech term you hear
into a plain-language concept card, connects it to what you already know, and
drills it with spaced-repetition flashcards — installs to your iPhone home
screen like an app, no Mac, no Xcode, no App Store. Same static-files model as
*mealfast* and *healthdashboard*.

Primer ships pre-loaded with ~24 concepts (data platforms, AI models, RAG,
Agile, and more). New concepts are authored with Claude and delivered via git
(see "Adding new concepts" below); the app picks them up automatically. Live
in-app AI Capture is built but deferred — see `BACKLOG.md`.

## The four tabs

- **Capture** — type any term; get a structured explanation (why it exists, an
  analogy, what it connects to, a one-line summary) and it's saved.
- **Library** — every concept, grouped by theme, searchable, fully offline.
- **Map** — tap a concept to see what it links to; builds a *connected* mental
  model rather than isolated facts.
- **Review** — spaced-repetition flashcards for whatever's due. This is what
  makes things stick.

## How the data works

Everything is stored **only in this browser's storage** (localStorage), on
device. No account, no sync, no server. The one exception is the optional AI
Capture, which sends just the term you type to **your own** Cloudflare Worker
(so your API key stays private). Use **More → Export backup** to save a copy.

## Files

```
index.html    the four screens + overlays      manifest.json  installable-app metadata
style.css     styling (dark-warm tokens)        sw.js          offline cache
app.js        all logic + spaced repetition      config.js      your Worker URL (no secrets)
concepts.js   the ~25 seeded concept cards        icons/         home-screen icons
worker/       Cloudflare Worker for AI Capture (holds the API key, never in the repo)
```

## Step 1 — Host the files (required for install)

iOS needs these served over `https://` for "Add to Home Screen" to work as a
real installed app. **GitHub Pages is free (~5 min):**

1. Create a public repo named `primer`.
2. Upload every file in this folder (keep the `icons/` and `worker/` folders).
3. Repo **Settings → Pages** → Source: `main` branch, `/ (root)`, save.
4. You'll get `https://<your-username>.github.io/primer/`.

(Netlify Drop — netlify.com/drop — is a faster drag-the-folder alternative.)

Open that URL on your iPhone in Safari → Share → **Add to Home Screen**.

Primer works fully at this point in **offline manual mode** (browse, review,
and manually add terms). AI Capture is optional — set it up next if you want
terms explained automatically.

## Adding new concepts (content refresh)

New concepts live in `concepts.js`. You author them with Claude and push; the
app's **merge-on-update** adds anything new on next open, dedupes by term, and
never touches your review progress or streak.

- **From your phone (no laptop):** ask Claude (with a GitHub connector authorised
  for the `primer` repo) to append the concept to `concepts.js` and commit it.
- **From your laptop:** ask Claude for the concept, append it to `concepts.js`,
  then run `push.bat`. That script **pulls first** (rebasing onto anything your
  phone committed) before pushing, so the two routes never overwrite each other.
- **Convention:** always **append** new concepts to the *end* of the array in
  `concepts.js`. The phone and laptop then edit different lines and git
  auto-merges cleanly.
- After a content change, bump `CACHE_NAME` in `sw.js` so installed devices
  fetch the update.

## Step 2 — (Optional, backlog) Turn on live AI Capture

This lets you type a term and get an explanation written for you. It runs on a
free Cloudflare Worker that holds your LLM API key, so the key never lives in
the public repo or on your phone.

1. Install the CLI once: `npm i -g wrangler` and `wrangler login`.
2. From the `worker/` folder, edit `wrangler.toml` → set `APP_URL` to your
   GitHub Pages URL. Optionally change `MODEL`.
3. Set your two secrets (Cloudflare encrypts them):
   ```
   npx wrangler secret put ANTHROPIC_API_KEY   # your Anthropic API key
   npx wrangler secret put APP_KEY             # any pass-phrase you invent
   ```
4. Deploy: `npx wrangler deploy`. You'll get a URL like
   `https://primer.<your-account>.workers.dev`.
5. Put that URL in `config.js` → `WORKER_URL`, and re-deploy the app (push to
   GitHub / re-drop to Netlify).
6. In the app: **More → AI Capture** → enter the same `APP_KEY` pass-phrase
   once. Done — now typing a term auto-explains it.

To use a non-Anthropic model, swap the `callLLM()` function in `worker/worker.js`.

## Updating

Bump `CACHE_NAME` in `sw.js` (e.g. `primer-v1` → `primer-v2`) whenever you
change files, so the new version reaches installed devices on next open.

## Privacy

No personal data is involved — you're looking up public tech terms. In offline
mode nothing leaves the device at all. With AI Capture on, only the single term
you type is sent to your own Worker.
