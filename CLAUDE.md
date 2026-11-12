# Primer — project context & handoff

This file is the full working context for the **Primer** app. It lives in the repo
root so that Claude (Claude Code / Cowork) auto-reads it and understands the project
on a new machine. If you're a fresh Claude session: read this top to bottom before
touching anything.

Owner: Rajkumar Pattabi. Built iteratively with Claude in Cowork mode.

---

## 1. What Primer is

A **private, offline-first learning companion** (a PWA) that turns tech terms the
owner hears — in meetings, docs, calls — into bite-sized concept cards he can browse,
explore as a connection graph, and drill with spaced-repetition flashcards. It's the
app embodiment of his "Learning Assistant" style: plain-language, conceptual,
analogy-first, each concept connected to others.

It is a **fourth sibling** to the owner's other PWAs (`mealfast`, `healthdashboard`,
`portfolioguidance`) and deliberately follows their conventions: static files, no
framework, no build step, installs to the iPhone home screen, data in `localStorage`,
hosted free on GitHub Pages.

- **GitHub repo:** `rajkumarpattabi/primer` (public)
- **Live URL (GitHub Pages):** https://rajkumarpattabi.github.io/primer/
- **Current version:** app `v1.8.5`, service-worker cache `primer-v27`, **67 concepts**
  (these move; always check `APP_VERSION` in `app.js`, `CACHE_NAME` in `sw.js`, and the
  length of `window.PRIMER_SEED` in `concepts.js`).

---

## 2. File map

```
index.html     App shell: 4 tabs (Home, Map, Review, More) + concept overlay. Loads config.js, concepts.js, app.js.
style.css      All styling. Light "study notebook" theme; design tokens in :root. Per-theme accent colours.
app.js         All behaviour (vanilla JS IIFE). Sections marked with banner comments.
concepts.js    The seed data: window.PRIMER_SEED = [ ...JSON... ];  (pretty-printed array of concept objects)
config.js      Non-secret config: WORKER_URL (AI capture, unused), GH_OWNER/GH_REPO/GH_BRANCH.
sw.js          Service worker. Network-first for app shell, cache-first for icons. Bump CACHE_NAME each deploy.
manifest.json  PWA metadata (name, icons, theme colour).
icons/         App icons (indigo tile + white knowledge-graph mark). icon-192/512/1024, apple-touch-icon.
inbox/         Capture queue: one tiny .md per captured term (plus README.md). Drained by /primer-add.
inbox.md       Alternate manual capture queue (## Queue section). Also drained by /primer-add.
worker/        Cloudflare Worker for live AI Capture — BUILT BUT DEFERRED (not deployed). See backlog.
README.md      User-facing readme (install + workflow).
BACKLOG.md     Deferred features.
first-push.bat Run ONCE on a new machine to finish/repair first commit + push.
setup-git.bat  One-time git init + first push (alternative to first-push).
push.bat       Everyday deploy: cleans empty inbox captures, stages, commits, pulls --rebase, pushes.
CLAUDE.md      This file.
```

---

## 3. Architecture & key conventions

- **Pure static PWA.** No framework, no bundler. Edit files directly.
- **Data model:** concepts live in `concepts.js` as the seed. On every load, `app.js`'s
  `mergeSeed()` copies the seed into `localStorage`, **dedupes by term**, **refreshes
  static content from the seed** (so edits + new fields like `brief` propagate to
  already-stored concepts), and **preserves runtime state** (flashcard `srs` schedule,
  `inReview`, `read`, `createdAt`, `streak`). This is why editing `concepts.js` and
  redeploying never wipes the user's review progress.
- **Versioning discipline (IMPORTANT):** every change that should reach installed
  devices must bump **both** `APP_VERSION` in `app.js` and `CACHE_NAME` in `sw.js`
  (e.g. `primer-v27` → `primer-v28`). The version shows in **More** and top-left, so the
  user can confirm a device updated.
- **Verification:** after edits, always `node --check concepts.js && node --check app.js`.
  For UI/logic changes, a jsdom smoke test is the reliable check (the sandbox has node +
  jsdom via `npm install jsdom --no-save`). CSS-visibility bugs won't show in jsdom — a
  real browser render is the only sure check for those.
- **Sandbox vs laptop paths:** Claude's Linux sandbox mounts the repo at
  `/sessions/<id>/mnt/dev/primer`. File *content* writes sync to the laptop; **file
  deletions from the sandbox do NOT reach the laptop** — so cleanup is done on the
  laptop by `push.bat`, and the drain workflow EMPTIES capture files (content write)
  rather than deleting them.

---

## 4. Concept schema

Each object in `window.PRIMER_SEED`:

```
{
  "term":       "short canonical name",
  "theme":      "Data platforms" | "Governance" | "AI models" | "AI applications" | "Ways of working" | "Concepts",
  "oneLiner":   "<=12-word subtitle",
  "why":        "1-2 sentences: why it exists / what problem it solves",
  "analogy":    "one vivid real-world analogy",
  "connects":   ["2-5 related term names"],          // drives the Map edges; prefer existing terms
  "summary":    "one-sentence takeaway (flashcard fallback; no longer shown on the detail page)",
  "nextTopics": ["3-5 terms, foundational -> advanced"],
  "cards":      [{ "q": "...", "a": "..." }],        // 1-3 flashcards
  "brief":      "3-4 sentence connected paragraph shown as the 'Briefly' section"
}
```

- `brief` must be **additive** — expand the one-liner (what + how + where), don't repeat
  the analogy/summary/why verbatim.
- Append new concepts to the **end** of the array (append-only keeps git merges clean
  between the phone and laptop routes).
- Runtime-only fields (added by `normaliseConcept`, not authored): `id`, `inReview`,
  `read`, `createdAt`, and `cards[].srs { due, interval, reps, lapses }`.

---

## 5. Design system

- Light "study notebook" theme. Tokens in `style.css :root` (`--paper`, `--surface`,
  `--ink`, `--accent` indigo `#4C63E6`, etc.).
- **Per-theme accent colours** (kept in sync between `style.css --t-*` and `THEME_COLORS`
  in `app.js`): Data platforms `#2F80ED`, Governance `#7C5CFC`, AI models `#109E87`,
  AI applications `#E8833A`, Ways of working `#D9488A`, Concepts `#C98A12`.
- Themes are ordered by **concept count desc**, with a fixed foundational→advanced order
  as tiebreak (`orderedThemes()` / `THEME_ORDER`).
- Sentence case, flat (no gradients), rounded cards, mobile-first with iOS safe-area insets.

---

## 6. Current feature set

- **Home tab** (the landing + hub): one search box that filters the concept grid live
  AND doubles as the "Retrieve / Search" add box (exact match → "Open"; new term →
  queues to git). A 2-row "Recently captured" strip. Theme sections are **collapsible**
  (default expanded). Each concept card shows an **indigo unread dot** until opened.
- **Map tab:** browse theme chips → tap a concept to open its **ego-graph** (focused
  concept centred, neighbours fanned out with **curved connectors**, plus faint
  **second-degree** nodes). Single-tap a node to re-centre; "Open details ▸" opens the
  card. All single-tap (no double-tap).
- **Review tab:** spaced repetition (SM-2-lite). **Stacked cards** (active + up to 3
  ghosts). **Swipe** the card (or ↦ Skip) to send it to the back of the queue.
  **Progress bar** + "Card X of N". Three grades after reveal: **Again** (~10 min),
  **Good** (~2.2×), **Easy** (~3×). **Undo** last grade. **Filter chips** (All due / per
  theme / ★ Hard). **Hard/leech** flag after 3 lapses. **Reverse cards** (~1 in 3 show the
  answer and ask for the term). End-of-session **summary** with Again/Good/Easy tally.
- **Concept detail overlay:** term, one-liner, Why it exists, Analogy, Connects to
  (tappable), **Briefly** (paragraph), Learn next. "＋ Add to review" / "Delete".
- **More tab:** collapsible sections (collapsed by default) — Capture to git (GitHub
  token), AI Capture (deferred), Your data (export/import backup), About (version).

---

## 7. THE CONTENT WORKFLOW (how concepts get added) — read this carefully

There is **no live AI in the app** (deferred). Content is authored by Claude and
delivered via git. Two capture routes feed one drain step.

**Capture (fills the queue):**
- **Phone (no connector):** in Primer, type a term in the Home box and tap
  **Retrieve / Search** → it commits a one-line file to `inbox/` on GitHub via the GitHub
  API, using a **fine-grained token stored only on the device** (More → Capture to git).
  A success shows a "Queued … to git" toast. If the token is missing/cleared, it silently
  falls back to a "not in library" toast and **nothing is committed** — this has bitten us
  before; if captures go missing, check the token first.
- **Laptop / Cowork:** just tell Claude the term(s), or let the inbox carry them.

**Drain (turns queued terms into full concepts) — the `/primer-add` skill:**
1. `git pull` first (or run `push.bat`, which pulls) so phone captures are local —
   captures live on GitHub, not automatically on the laptop.
2. Run `/primer-add` (no args drains the inbox; or `/primer-add term1, term2` adds those
   plus the inbox). Claude: reads `concepts.js` + `inbox/*.md` + `inbox.md ## Queue`,
   dedupes against existing terms, writes a full concept (incl. `brief`) per new term,
   **appends** to `window.PRIMER_SEED`, **empties** each processed capture file and the
   `## Queue`, bumps `APP_VERSION` + `CACHE_NAME`, and `node --check`s.
3. Run **`push.bat`** — it deletes the now-empty capture files, commits, pulls --rebase
   (so phone commits are never clobbered), and pushes. GitHub Pages redeploys.
4. On the phone, fully close and reopen Primer; `mergeSeed` ingests the new concepts and
   the version stamp ticks up.

**Why append-only + pull-before-push:** the phone and laptop both commit to the same repo.
Appending new concepts to the end, and always pulling (rebase, autostash) before pushing,
keeps the two routes from colliding.

---

## 8. New-laptop setup (do this first)

1. Ensure **git** and **Node.js** are installed.
2. Set git identity if needed:
   `git config --global user.name "Rajkumar Pattabi"`
   `git config --global user.email "rajkumar.com@gmail.com"`  (the repo's commit email)
3. The repo backup is already present. If it's already a git repo with the `origin`
   remote set, just use `push.bat` / `git pull` normally.
   If git isn't wired up (no `.git`, or first commit never completed), run
   **`first-push.bat`** once — it clears any stale lock, sets identity, commits, and pushes.
4. **The `/primer-add` skill is saved to the Claude account, not the repo.** If you sign
   in to the same Claude account on the new laptop, it's already there. If not, recreate
   it from the copy in **Appendix A** below (via Cowork's save-skill, or just paste it to
   Claude and ask it to follow it).
5. The **GitHub capture token** lives only in the phone's browser storage — it is NOT in
   the repo and does not need migrating. (If the phone is reinstalled, regenerate a
   fine-grained token with Contents:write on `primer` and re-enter it in More.)

---

## 9. Known gotchas / lessons learned

- **Bump both versions** or installed devices won't visibly update.
- **`[hidden]` vs CSS `display`:** a global `[hidden]{display:none!important}` rule exists
  because `.overlay{display:flex}` etc. otherwise override the HTML `hidden` attribute.
  Don't remove it.
- **Sandbox can't delete files on the laptop** — empty capture files in the drain; let
  `push.bat` delete the empties. `mcp__cowork__allow_cowork_file_delete` enables sandbox
  deletes within the session but still may not reach the laptop, so don't rely on it for
  repo cleanup.
- **Missing capture token** = silent no-op capture (see §7).
- **GitHub API isn't readable from Claude's web_fetch** (blocked without a user-agent), so
  Claude can't list the remote inbox; rely on `git pull` to see phone captures locally.
- **concepts.js is JSON-serialized** (`window.PRIMER_SEED = [ … ];`); appending a plain
  JS object literal before the final `];` is fine.

---

## 10. Backlog (not built)

Live in-app AI Capture (Cloudflare Worker exists in `worker/`, deferred). Review extras
not yet added: daily new-card limit, keyboard shortcuts, reverse-card toggle. Map: optional
toggle for second-degree density on crowded concepts. Persist Home collapse state across
reloads. See `BACKLOG.md`.

---

## Appendix A — the `/primer-add` skill (recreate if the account skill is missing)

Name: `primer-add`. Description: "Add one or more concepts to the Primer learning app,
and/or drain the mobile capture queue." Content:

> The user gives ONLY a concept name, or several comma-separated names — or nothing
> (drain the queue). Read `concepts.js` (existing terms), every `inbox/*.md` capture file
> (ignore `inbox/README.md`), and the `## Queue` lines in `inbox.md`. Final term list =
> queued terms + any passed in the command, minus terms already present (skip + mention
> duplicates). For each new term, research it and build one concept object matching the
> schema in §4 of CLAUDE.md (including a genuinely additive `brief`). Append the object(s)
> to the END of `window.PRIMER_SEED` (append-only; keep valid JS, trailing `];`). Clear the
> queue by EMPTYING each processed source (do NOT delete from the sandbox — write empty
> content): empty `## Queue` in `inbox.md`, and overwrite each processed `inbox/*.md` with
> an empty string (leave `inbox/README.md`). Bump `APP_VERSION` in `app.js` and `CACHE_NAME`
> in `sw.js`. Syntax-check `node --check concepts.js && node --check app.js`. Tell the user
> it's ready and to run `push.bat` (do not push automatically). Comparison captures
> ("X vs Y") → usually one concept per item, cross-linked, unless the comparison is the point.
