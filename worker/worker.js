/* Primer — Cloudflare Worker (AI Capture)
 *
 * Turns a term into a structured concept card using an LLM, WITHOUT ever
 * exposing your API key to the app or the phone (same model as the
 * portfolioguidance worker). The app POSTs a term; this returns concept JSON.
 *
 * Route:
 *   POST /explain?k=APP_KEY   body: {"term": "lakehouse"}
 *     -> { term, theme, oneLiner, why, analogy, connects[], summary,
 *          nextTopics[], cards[{q,a}] }
 *
 * Bindings (see wrangler.toml):
 *   Vars:    APP_URL (your GitHub Pages app URL), MODEL (LLM model id)
 *   Secrets: ANTHROPIC_API_KEY, APP_KEY   (set with `wrangler secret put ...`)
 *
 * Uses the Anthropic Messages API. To use a different provider, swap callLLM().
 */

const THEMES = ["Data platforms", "Governance", "AI models", "AI applications", "Ways of working", "Concepts"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const origin = allowedOrigin(env);

    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }), origin);

    try {
      if (path === "/") return cors(json({ ok: true, service: "primer-worker" }), origin);
      if (path === "/explain") return cors(await handleExplain(request, url, env), origin);
      return cors(json({ error: "not_found" }, 404), origin);
    } catch (e) {
      return cors(json({ error: "worker_error", detail: String((e && e.message) || e) }, 500), origin);
    }
  }
};

function allowedOrigin(env) { try { return new URL(env.APP_URL).origin; } catch (e) { return "*"; } }
function cors(res, origin) {
  const h = new Headers(res.headers);
  h.set("Access-Control-Allow-Origin", origin || "*");
  h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type");
  h.set("Cache-Control", "no-store");
  return new Response(res.body, { status: res.status, headers: h });
}
function json(obj, status) { return new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json" } }); }
function checkKey(url, env) { return env.APP_KEY && url.searchParams.get("k") === env.APP_KEY; }

async function handleExplain(request, url, env) {
  if (!checkKey(url, env)) return json({ error: "unauthorized" }, 401);
  let body = {}; try { body = await request.json(); } catch (e) {}
  const term = (body.term || "").toString().trim().slice(0, 120);
  if (!term) return json({ error: "no_term" }, 400);
  if (!env.ANTHROPIC_API_KEY) return json({ error: "no_api_key_configured" }, 500);

  const raw = await callLLM(term, env);
  const concept = coerceConcept(raw, term);
  return json(concept);
}

const SYSTEM = [
  "You explain new technology terms to a smart learner who is NEW to the topic.",
  "Prioritise conceptual understanding and intuition over implementation detail.",
  "Use simple, non-technical language and a concrete real-world analogy.",
  "Avoid jargon; if a term is needed, define it in plain words.",
  "Respond with ONLY a single JSON object, no markdown, no prose around it."
].join(" ");

function userPrompt(term) {
  return [
    'Explain the term: "' + term + '".',
    "Return a JSON object with EXACTLY these keys:",
    '{',
    '  "term": short canonical name,',
    '  "theme": one of ' + JSON.stringify(THEMES) + ',',
    '  "oneLiner": a <=12-word subtitle,',
    '  "why": 1-2 sentences on why it exists / what problem it solves,',
    '  "analogy": one vivid real-world analogy,',
    '  "connects": array of 2-5 related term names,',
    '  "summary": one-sentence key takeaway,',
    '  "nextTopics": array of 3-5 term names to learn next (foundational -> advanced),',
    '  "cards": array of 1-3 {"q","a"} flashcards testing the core idea',
    '}',
    "Keep every field concise. Output JSON only."
  ].join("\n");
}

async function callLLM(term, env) {
  const model = env.MODEL || "claude-sonnet-5";
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt(term) }]
    })
  });
  const data = await r.json();
  if (!r.ok) throw new Error((data && data.error && data.error.message) || ("LLM HTTP " + r.status));
  const text = (data.content || []).map((b) => b.text || "").join("").trim();
  return text;
}

// Pull the JSON object out of the model's text and validate/repair it.
function coerceConcept(text, term) {
  let obj = {};
  try { obj = JSON.parse(text); }
  catch (e) {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { obj = JSON.parse(m[0]); } catch (e2) {} }
  }
  const arr = (v) => Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).slice(0, 6) : [];
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  let theme = str(obj.theme);
  if (THEMES.indexOf(theme) === -1) theme = "Concepts";
  let cards = Array.isArray(obj.cards)
    ? obj.cards.filter((c) => c && c.q && c.a).map((c) => ({ q: str(c.q), a: str(c.a) })).slice(0, 3)
    : [];
  if (!cards.length) cards = [{ q: "What is " + (str(obj.term) || term) + "?", a: str(obj.summary) || str(obj.oneLiner) || "" }];
  return {
    term: str(obj.term) || term,
    theme,
    oneLiner: str(obj.oneLiner),
    why: str(obj.why),
    analogy: str(obj.analogy),
    connects: arr(obj.connects),
    summary: str(obj.summary),
    nextTopics: arr(obj.nextTopics),
    cards
  };
}
