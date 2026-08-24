/* ============================================================================
 * Primer — app.js (all behaviour)
 * ----------------------------------------------------------------------------
 * Vanilla JS, no framework, no build step (same as mealfast / healthdashboard).
 * Data lives only in localStorage on this device. The only network call is the
 * optional AI Capture, which POSTs a term to YOUR Cloudflare Worker (config.js)
 * and gets back a structured concept — the API key never touches this file.
 *
 * Sections: STATE & STORAGE · SPACED REPETITION · TABS · CAPTURE · LIBRARY ·
 *           MAP · REVIEW · CONCEPT OVERLAY · SETTINGS · HELPERS · BOOT
 * ==========================================================================*/

(function () {
  "use strict";

  /* ------------------------------ STATE & STORAGE ------------------------- */
  const LS_CONCEPTS = "primer.concepts";
  const LS_SETTINGS = "primer.settings";
  const DAY = 86400000;

  let concepts = [];                 // [{id, term, theme, ...seed fields, cards:[{q,a,srs}], inReview, createdAt}]
  let settings = { appKey: "", ghToken: "", streak: 0, lastStudy: "" };

  const WORKER_URL = (window.PRIMER_CONFIG && window.PRIMER_CONFIG.WORKER_URL || "").replace(/\/+$/, "");

  // Version stamp — BUMP THIS on each release so a device shows which build it runs.
  const APP_VERSION = "1.4.1";

  // Per-theme accent colours (kept in sync with the --t-* vars in style.css).
  const THEME_COLORS = {
    "Data platforms": "#2F80ED",
    "Governance": "#7C5CFC",
    "AI models": "#109E87",
    "AI applications": "#E8833A",
    "Ways of working": "#D9488A",
    "Concepts": "#C98A12"
  };
  function themeColor(t) { return THEME_COLORS[t] || "#4C63E6"; }

  // Logical (foundational -> advanced) theme order, used as a tiebreak.
  const THEME_ORDER = ["Data platforms", "Governance", "AI models", "AI applications", "Ways of working", "Concepts"];
  // Order themes by how many concepts they contain (most first), logical order as tiebreak.
  function orderedThemes(groups) {
    return Object.keys(groups).sort((a, b) => {
      const d = groups[b].length - groups[a].length;
      if (d !== 0) return d;
      const ia = THEME_ORDER.indexOf(a), ib = THEME_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }

  // Where the in-app "Queue to git" capture writes (non-secret; token is separate).
  const GH = {
    owner: (window.PRIMER_CONFIG && window.PRIMER_CONFIG.GH_OWNER) || "rajkumarpattabi",
    repo: (window.PRIMER_CONFIG && window.PRIMER_CONFIG.GH_REPO) || "primer",
    branch: (window.PRIMER_CONFIG && window.PRIMER_CONFIG.GH_BRANCH) || "main"
  };
  // UTF-8-safe base64 (GitHub wants file content base64-encoded).
  function b64(s) { return btoa(unescape(encodeURIComponent(s))); }

  function load() {
    try { concepts = JSON.parse(localStorage.getItem(LS_CONCEPTS) || "[]"); } catch (e) { concepts = []; }
    try { settings = Object.assign(settings, JSON.parse(localStorage.getItem(LS_SETTINGS) || "{}")); } catch (e) {}
  }
  function saveConcepts() { localStorage.setItem(LS_CONCEPTS, JSON.stringify(concepts)); }
  function saveSettings() { localStorage.setItem(LS_SETTINGS, JSON.stringify(settings)); }

  // Merge-on-update: on every load, pull in any concepts from concepts.js that
  // aren't already on this device (new content pushed via git shows up here),
  // WITHOUT touching existing cards, review progress or streak. Also dedupes
  // existing storage by term as a safety net for the two-route (phone+laptop)
  // workflow. Returns { firstRun, added } so we can toast when new content lands.
  function mergeSeed() {
    const firstRun = localStorage.getItem(LS_CONCEPTS) === null;
    let existing = [];
    try { existing = JSON.parse(localStorage.getItem(LS_CONCEPTS) || "[]"); } catch (e) { existing = []; }

    const seen = new Set();
    const merged = [];
    existing.forEach((c) => {
      const k = (c.term || "").trim().toLowerCase();
      if (k && !seen.has(k)) { seen.add(k); merged.push(c); }
    });
    const dupsRemoved = existing.length - merged.length;

    let added = 0;
    (window.PRIMER_SEED || []).forEach((s) => {
      const k = (s.term || "").trim().toLowerCase();
      if (k && !seen.has(k)) { seen.add(k); merged.push(normaliseConcept(s, true)); added++; }
    });

    concepts = merged;
    if (firstRun || added || dupsRemoved) saveConcepts();
    return { firstRun, added };
  }

  // Turn a raw concept (seed or AI) into the stored shape.
  function normaliseConcept(raw, inReview) {
    const now = Date.now();
    const cards = (raw.cards || []).map((cd) => ({
      q: cd.q, a: cd.a,
      srs: { due: now, interval: 0, reps: 0 }
    }));
    return {
      id: raw.id || uid(),
      term: (raw.term || "Untitled").trim(),
      theme: raw.theme || "Concepts",
      oneLiner: raw.oneLiner || "",
      why: raw.why || "",
      analogy: raw.analogy || "",
      connects: Array.isArray(raw.connects) ? raw.connects : [],
      summary: raw.summary || "",
      nextTopics: Array.isArray(raw.nextTopics) ? raw.nextTopics : [],
      cards: cards,
      inReview: inReview !== false,
      createdAt: raw.createdAt || now
    };
  }

  function findConcept(id) { return concepts.find((c) => c.id === id); }
  function findByTerm(term) {
    const t = (term || "").trim().toLowerCase();
    return concepts.find((c) => c.term.toLowerCase() === t);
  }

  /* ------------------------------ SPACED REPETITION ----------------------- */
  // Compact SM-2-lite. Grades: "again" | "good" | "easy".
  function grade(card, g) {
    const now = Date.now();
    const s = card.srs;
    if (g === "again") { s.interval = 0; s.reps = 0; s.due = now + 10 * 60 * 1000; }
    else {
      const factor = g === "easy" ? 3.0 : 2.2;
      if (s.reps === 0) s.interval = g === "easy" ? 3 : 1;
      else s.interval = Math.max(1, Math.round(s.interval * factor));
      s.reps += 1;
      s.due = now + s.interval * DAY;
    }
    bumpStreak();
    saveConcepts();
  }

  function dueCards() {
    const now = Date.now();
    const out = [];
    concepts.forEach((c) => {
      if (!c.inReview) return;
      c.cards.forEach((card, i) => { if (card.srs.due <= now) out.push({ concept: c, card, i }); });
    });
    return out;
  }

  function bumpStreak() {
    const today = new Date().toISOString().slice(0, 10);
    if (settings.lastStudy === today) return;
    const yest = new Date(Date.now() - DAY).toISOString().slice(0, 10);
    settings.streak = settings.lastStudy === yest ? (settings.streak || 0) + 1 : 1;
    settings.lastStudy = today;
    saveSettings();
    renderStreak();
  }

  /* ------------------------------ TABS ------------------------------------ */
  function setTab(name) {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.id === "tab-" + name));
    document.querySelectorAll(".tabbtn").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    if (name === "library") renderLibrary();
    if (name === "map") renderMap();
    if (name === "review") renderReview();
    if (name === "capture") renderCapture();
    if (name === "more") renderMore();
    document.querySelector("main").scrollTop = 0;
  }

  /* ------------------------------ CAPTURE --------------------------------- */
  async function doExplain() {
    const input = document.getElementById("termInput");
    const term = input.value.trim();
    if (!term) return;
    const hint = document.getElementById("captureHint");

    const existing = findByTerm(term);
    if (existing) { input.value = ""; openConcept(existing.id); return; }
    if (!settings.appKey) { setTab("more"); toast("Enter your app pass-phrase first."); return; }

    const btn = document.getElementById("explainBtn");
    btn.disabled = true;
    hint.innerHTML = '<span class="spinner"></span>Explaining “' + escapeHtml(term) + '” …';
    try {
      const res = await fetch(WORKER_URL + "/explain?k=" + encodeURIComponent(settings.appKey), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term })
      });
      if (res.status === 401) { hint.textContent = "Pass-phrase rejected. Check it in More →."; btn.disabled = false; return; }
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const c = normaliseConcept(data, true);
      concepts.unshift(c); saveConcepts();
      input.value = ""; hint.textContent = "";
      openConcept(c.id);
      toast("Saved “" + c.term + "”");
    } catch (e) {
      hint.textContent = "Couldn't reach AI Capture (" + (e.message || e) + "). You're offline or the Worker isn't set up.";
    } finally {
      btn.disabled = false;
    }
  }

  // Default handler when live AI Capture is on the backlog (no WORKER_URL):
  // the box is a quick "jump to a concept". New content arrives via git (Path A).
  function doFind() {
    const input = document.getElementById("termInput");
    const term = input.value.trim();
    if (!term) return;
    const hit = findByTerm(term) || concepts.find((c) => c.term.toLowerCase().includes(term.toLowerCase()));
    if (hit) { input.value = ""; openConcept(hit.id); return; }
    toast('Not in your library yet — ask Claude to add "' + term + '" and push.');
  }

  // Commit a term straight to the repo's inbox/ folder via the GitHub API, so the
  // laptop can later turn it into a full concept. Token is stored only on-device.
  async function queueToGit() {
    const input = document.getElementById("termInput");
    const term = input.value.trim();
    if (!term) return;
    const hint = document.getElementById("captureHint");
    const btn = document.getElementById("explainBtn");
    btn.disabled = true;
    hint.innerHTML = '<span class="spinner"></span>Queuing “' + escapeHtml(term) + '” to git…';
    try {
      const path = "inbox/" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6) + ".md";
      const url = "https://api.github.com/repos/" + GH.owner + "/" + GH.repo + "/contents/" + path;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": "Bearer " + settings.ghToken,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: "capture: " + term, content: b64(term + "\n"), branch: GH.branch })
      });
      if (res.status === 401 || res.status === 403) { hint.textContent = "GitHub token rejected or lacks access. Check it in More →."; btn.disabled = false; return; }
      if (!res.ok) throw new Error("HTTP " + res.status);
      input.value = ""; hint.textContent = "";
      document.getElementById("captureSuggest").innerHTML = ""; refreshCaptureUI();
      toast("Queued “" + term + "” to git — becomes a full concept after the next laptop sync.");
    } catch (e) {
      hint.textContent = "Couldn't reach GitHub (" + (e.message || e) + "). Check your connection or token.";
    } finally {
      btn.disabled = false;
    }
  }

  // The Capture box is a combined search-or-add: submitting an existing term
  // opens it; a new term is queued to git (or AI/find if no token).
  function submitCapture() {
    const input = document.getElementById("termInput");
    const q = input.value.trim();
    if (!q) return;
    const exact = findByTerm(q);
    if (exact) { input.value = ""; document.getElementById("captureSuggest").innerHTML = ""; refreshCaptureUI(); openConcept(exact.id); return; }
    if (settings.ghToken) return queueToGit();
    if (WORKER_URL) return doExplain();
    return doFind();
  }

  function setCapturePlaceholder() {
    const i = document.getElementById("termInput");
    i.placeholder = settings.ghToken ? "Search a term, or add a new one…"
      : (WORKER_URL ? "Type any term you heard…" : "Search a concept…");
  }

  // Live search-as-you-type: show matching concepts and adapt the button
  // (Open an existing term, or Add a new one to git).
  function refreshCaptureUI() {
    const input = document.getElementById("termInput");
    const sug = document.getElementById("captureSuggest");
    const b = document.getElementById("explainBtn");
    const q = (input.value || "").trim();
    sug.innerHTML = "";
    if (q) {
      const ql = q.toLowerCase();
      concepts
        .filter((c) => c.term.toLowerCase().includes(ql) || (c.oneLiner || "").toLowerCase().includes(ql))
        .sort((a, b2) => a.term.localeCompare(b2.term))
        .slice(0, 6)
        .forEach((c) => {
          const it = document.createElement("div");
          it.className = "suggest-item";
          it.style.borderLeftColor = themeColor(c.theme);
          it.innerHTML = '<span class="st">' + escapeHtml(c.term) + '</span><span class="so">' + escapeHtml(c.theme) + "</span>";
          it.onclick = () => { input.value = ""; sug.innerHTML = ""; refreshCaptureUI(); openConcept(c.id); };
          sug.appendChild(it);
        });
    }
    const exact = q ? findByTerm(q) : null;
    if (exact) b.textContent = "Open";
    else if (settings.ghToken) b.textContent = "Retrieve / Search";
    else if (WORKER_URL) b.textContent = "Explain & save";
    else b.textContent = "Retrieve / Search";
  }

  function renderCapture() {
    renderStreak();
    const due = dueCards().length;
    const strip = document.getElementById("dueStrip");
    strip.hidden = due === 0;
    document.getElementById("dueCount").textContent = due + (due === 1 ? " card due" : " cards due");

    const recent = concepts.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 12);
    const wrap = document.getElementById("recentList");
    wrap.innerHTML = "";
    recent.forEach((c, idx) => {
      const chip = document.createElement("span");
      chip.className = "chip" + (idx === 0 ? " teal" : "");
      chip.textContent = c.term;
      chip.onclick = () => openConcept(c.id);
      wrap.appendChild(chip);
    });
    document.getElementById("captureEmpty").hidden = concepts.length > 0;
    document.querySelector("#tab-capture .section-cap").hidden = concepts.length === 0;
    refreshCaptureUI();
  }

  /* ------------------------------ LIBRARY --------------------------------- */
  function renderLibrary() {
    const q = (document.getElementById("librarySearch").value || "").trim().toLowerCase();
    const list = document.getElementById("libraryList");
    list.innerHTML = "";

    const filtered = concepts.filter((c) =>
      !q || c.term.toLowerCase().includes(q) || (c.oneLiner || "").toLowerCase().includes(q) || (c.theme || "").toLowerCase().includes(q)
    );
    document.getElementById("libraryEmpty").hidden = concepts.length > 0;

    // group by theme
    const groups = {};
    filtered.forEach((c) => { (groups[c.theme] = groups[c.theme] || []).push(c); });

    const now = Date.now();
    orderedThemes(groups).forEach((theme) => {
      const col = themeColor(theme);
      const h = document.createElement("div"); h.className = "theme-head";
      h.textContent = theme + " (" + groups[theme].length + ")";
      h.style.color = col;
      list.appendChild(h);

      const grid = document.createElement("div"); grid.className = "lib-grid";
      groups[theme].sort((a, b) => a.term.localeCompare(b.term)).forEach((c) => {
        const isDue = c.inReview && c.cards.some((cd) => cd.srs.due <= now);
        const card = document.createElement("div");
        card.className = "lib-card";
        card.style.borderLeftColor = themeColor(c.theme);
        card.innerHTML =
          '<div class="lt">' + escapeHtml(c.term) + "</div>" +
          '<div class="lo">' + escapeHtml(c.oneLiner || "") + "</div>" +
          (isDue ? '<span class="due-dot" title="due for review"></span>' : "");
        card.onclick = () => openConcept(c.id);
        grid.appendChild(card);
      });
      list.appendChild(grid);
    });
  }

  /* ------------------------------ MAP ------------------------------------- */
  let mapFocus = null;   // concept id currently centered in the ego-graph

  function renderMap() {
    const canvas = document.getElementById("mapCanvas");
    const intro = document.querySelector("#tab-map .map-intro");
    canvas.innerHTML = "";
    document.getElementById("mapEmpty").hidden = concepts.length > 0;
    if (concepts.length === 0) { if (intro) intro.hidden = true; return; }

    const focus = mapFocus ? findConcept(mapFocus) : null;
    if (focus) { if (intro) intro.hidden = true; renderEgoGraph(canvas, focus); }
    else { if (intro) intro.hidden = false; renderMapBrowse(canvas); }
  }

  // Browse state: theme-grouped chips. Tap one to open its ego-graph.
  function renderMapBrowse(canvas) {
    const groups = {};
    concepts.forEach((c) => { (groups[c.theme] = groups[c.theme] || []).push(c); });
    orderedThemes(groups).forEach((theme) => {
      const g = document.createElement("div"); g.className = "map-group";
      const h = document.createElement("div"); h.className = "theme-head";
      h.textContent = theme + " (" + groups[theme].length + ")";
      h.style.color = themeColor(theme);
      g.appendChild(h);
      groups[theme].sort((a, b) => a.term.localeCompare(b.term)).forEach((c) => {
        const node = document.createElement("span");
        node.className = "map-node";
        node.textContent = c.term;
        node.style.borderColor = themeColor(c.theme);
        node.onclick = () => { mapFocus = c.id; renderMap(); document.querySelector("main").scrollTop = 0; };
        g.appendChild(node);
      });
      canvas.appendChild(g);
    });
  }

  // A concept's neighbours: its own `connects` plus any concept that lists it.
  function connectionsOf(c) {
    const names = new Set((c.connects || []).map((t) => t.toLowerCase()));
    concepts.forEach((o) => { if ((o.connects || []).some((t) => t.toLowerCase() === c.term.toLowerCase())) names.add(o.term.toLowerCase()); });
    const out = [], seen = new Set();
    names.forEach((n) => {
      const hit = concepts.find((o) => o.term.toLowerCase() === n);
      if (hit && hit.id !== c.id && !seen.has(hit.id)) { seen.add(hit.id); out.push(hit); }
    });
    return out;
  }

  // Ego-graph: the focused concept centred, neighbours fanned around it with
  // connector lines. Tap a neighbour to re-centre; "Open details" for the full card.
  function renderEgoGraph(canvas, center) {
    const bar = document.createElement("div"); bar.className = "ego-bar";
    const back = document.createElement("button"); back.className = "link-btn"; back.textContent = "← Whole map";
    back.onclick = () => { mapFocus = null; renderMap(); };
    const open = document.createElement("button"); open.className = "btn-ghost"; open.textContent = "Open details ▸";
    open.onclick = () => openConcept(center.id);
    bar.appendChild(back); bar.appendChild(open);
    canvas.appendChild(bar);

    const links = connectionsOf(center).slice(0, 8);
    const stage = document.createElement("div"); stage.className = "ego";
    canvas.appendChild(stage);

    const W = stage.clientWidth || 320, H = 340;
    stage.style.height = H + "px";
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.33;

    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns, "svg");
    svg.setAttribute("width", "100%"); svg.setAttribute("height", String(H));
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    stage.appendChild(svg);

    const n = links.length;
    const pos = links.map((c, i) => {
      const ang = (-90 + i * (360 / Math.max(1, n))) * Math.PI / 180;
      return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang), c: c };
    });
    pos.forEach((p) => {
      const ln = document.createElementNS(svgns, "line");
      ln.setAttribute("x1", cx); ln.setAttribute("y1", cy);
      ln.setAttribute("x2", p.x); ln.setAttribute("y2", p.y);
      ln.setAttribute("stroke", "#D8D3C4"); ln.setAttribute("stroke-width", "1.5");
      svg.appendChild(ln);
    });

    const cnode = document.createElement("div");
    cnode.className = "ego-node center"; cnode.textContent = center.term;
    cnode.style.left = cx + "px"; cnode.style.top = cy + "px";
    cnode.style.background = themeColor(center.theme); cnode.style.borderColor = themeColor(center.theme);
    cnode.onclick = () => openConcept(center.id);
    stage.appendChild(cnode);

    pos.forEach((p) => {
      const nd = document.createElement("div");
      nd.className = "ego-node sat"; nd.textContent = p.c.term;
      nd.style.left = p.x + "px"; nd.style.top = p.y + "px";
      nd.style.color = themeColor(p.c.theme); nd.style.borderColor = themeColor(p.c.theme);
      nd.onclick = () => { mapFocus = p.c.id; renderMap(); };
      stage.appendChild(nd);
    });

    if (n === 0) {
      const note = document.createElement("div"); note.className = "map-links";
      note.textContent = "“" + center.term + "” has no connections yet.";
      canvas.appendChild(note);
    }
  }

  /* ------------------------------ REVIEW ---------------------------------- */
  let queue = [];
  let revealed = false;
  function renderReview() {
    queue = dueCards();
    revealed = false;
    const area = document.getElementById("reviewArea");
    if (queue.length === 0) {
      const totalInReview = concepts.filter((c) => c.inReview).length;
      area.innerHTML =
        '<div class="review-done"><div class="big">✓</div>' +
        (totalInReview === 0
          ? "<p>No cards in review yet. Open a concept and tap <b>＋ Add to review</b>.</p>"
          : "<p>All caught up. Nothing due right now — come back later.</p>") +
        "</div>";
      return;
    }
    showCard();
  }

  function showCard() {
    const area = document.getElementById("reviewArea");
    const item = queue[0];
    if (!item) { renderReview(); return; }
    const c = item.concept, card = item.card;
    area.innerHTML =
      '<div class="section-cap">' + queue.length + " due</div>" +
      '<div class="flashcard">' +
      '<div class="flash-term">' + escapeHtml(c.term) + "</div>" +
      '<div class="flash-q">' + escapeHtml(card.q) + "</div>" +
      (revealed ? '<div class="flash-a">' + escapeHtml(card.a) + "</div>" : "") +
      "</div>" +
      (revealed
        ? '<div class="grade-row">' +
            '<button class="btn-ghost g-again" data-g="again">Again</button>' +
            '<button class="btn-ghost g-good" data-g="good">Good</button>' +
            '<button class="btn-ghost g-easy" data-g="easy">Easy</button>' +
          "</div>"
        : '<button class="btn-primary show-btn" id="showAnsBtn">Show answer</button>');

    const ft = area.querySelector(".flash-term"); if (ft) ft.style.color = themeColor(c.theme);

    if (!revealed) {
      document.getElementById("showAnsBtn").onclick = () => { revealed = true; showCard(); };
    } else {
      area.querySelectorAll(".grade-row .btn-ghost").forEach((b) => {
        b.onclick = () => { grade(card, b.dataset.g); queue.shift(); revealed = false; showCard(); renderStreak(); };
      });
    }
  }

  /* ------------------------------ CONCEPT OVERLAY ------------------------- */
  let openId = null;
  function openConcept(id) {
    const c = findConcept(id);
    if (!c) return;
    openId = id;
    const col = themeColor(c.theme);
    const themeEl = document.getElementById("overlayTheme");
    themeEl.textContent = c.theme; themeEl.style.color = col; themeEl.style.borderColor = col;
    const body = document.getElementById("overlayBody");
    const block = (lbl, txt) => txt ? '<div class="detail-block"><div class="lbl">' + lbl + '</div><p>' + escapeHtml(txt) + "</p></div>" : "";
    let connectsHtml = "";
    if (c.connects && c.connects.length) {
      connectsHtml = '<div class="detail-block"><div class="lbl">Connects to</div><div class="detail-connects">' +
        c.connects.map((t) => {
          const linked = findByTerm(t);
          return '<span class="chip' + (linked ? " teal" : "") + '" data-term="' + escapeHtml(t) + '">' + escapeHtml(t) + "</span>";
        }).join("") + "</div></div>";
    }
    let nextHtml = "";
    if (c.nextTopics && c.nextTopics.length) {
      nextHtml = '<div class="detail-block"><div class="lbl">Learn next</div><div class="detail-connects">' +
        c.nextTopics.map((t) => '<span class="chip" data-next="' + escapeHtml(t) + '">' + escapeHtml(t) + "</span>").join("") +
        "</div></div>";
    }
    body.innerHTML =
      '<div class="detail-accent" style="background:' + col + '"></div>' +
      '<div class="detail-term">' + escapeHtml(c.term) + "</div>" +
      '<div class="detail-oneliner">' + escapeHtml(c.oneLiner || "") + "</div>" +
      block("Why it exists", c.why) +
      block("Analogy", c.analogy) +
      connectsHtml +
      block("In one line", c.summary) +
      nextHtml;
    body.querySelectorAll(".detail-block .lbl").forEach((el) => { el.style.color = col; });

    // wire connect chips -> open or capture
    body.querySelectorAll("[data-term]").forEach((el) => {
      el.onclick = () => {
        const linked = findByTerm(el.dataset.term);
        if (linked) openConcept(linked.id);
        else { closeOverlay(); setTab("capture"); document.getElementById("termInput").value = el.dataset.term; toast('Tap "Explain" to add ' + el.dataset.term); }
      };
    });
    body.querySelectorAll("[data-next]").forEach((el) => {
      el.onclick = () => { closeOverlay(); setTab("capture"); document.getElementById("termInput").value = el.dataset.next; toast('Tap "Explain" to learn ' + el.dataset.next); };
    });

    const addBtn = document.getElementById("addReviewBtn");
    addBtn.textContent = c.inReview ? "✓ In review" : "＋ Add to review";
    addBtn.classList.toggle("g-easy", c.inReview);

    document.getElementById("conceptOverlay").hidden = false;
  }
  function closeOverlay() { document.getElementById("conceptOverlay").hidden = true; openId = null; }

  function toggleReview() {
    const c = findConcept(openId); if (!c) return;
    c.inReview = !c.inReview;
    if (c.inReview) c.cards.forEach((cd) => { if (cd.srs.due > Date.now()) cd.srs.due = Date.now(); });
    saveConcepts();
    const addBtn = document.getElementById("addReviewBtn");
    addBtn.textContent = c.inReview ? "✓ In review" : "＋ Add to review";
    addBtn.classList.toggle("g-easy", c.inReview);
    toast(c.inReview ? "Added to review" : "Removed from review");
  }
  function deleteOpen() {
    const c = findConcept(openId); if (!c) return;
    if (!confirm('Delete "' + c.term + '"? This only affects this device.')) return;
    concepts = concepts.filter((x) => x.id !== openId);
    saveConcepts(); closeOverlay(); renderCapture(); toast("Deleted");
  }

  /* ------------------------------ SETTINGS -------------------------------- */
  function renderMore() {
    const status = document.getElementById("aiStatus");
    if (!WORKER_URL) status.textContent = "not configured — offline manual mode";
    else if (!settings.appKey) status.textContent = "Worker set — enter pass-phrase below";
    else status.textContent = "ready";
    document.getElementById("appKeyInput").value = settings.appKey || "";
    document.getElementById("ghTokenInput").value = settings.ghToken || "";
    document.getElementById("ghStatus").textContent = settings.ghToken ? "set — Capture writes to git" : "not set";
    renderVersion();
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify({ concepts, settings, exportedAt: Date.now() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "primer-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function importBackup(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (Array.isArray(data.concepts)) { concepts = data.concepts.map((c) => normaliseConcept(c, c.inReview !== false)); saveConcepts(); }
        if (data.settings) { settings = Object.assign(settings, data.settings); saveSettings(); }
        toast("Backup imported"); setTab("capture"); renderStreak();
      } catch (e) { toast("Couldn't read that file"); }
    };
    r.readAsText(file);
  }

  /* ------------------------------ HELPERS --------------------------------- */
  function uid() { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function escapeHtml(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }
  function renderStreak() {
    const s = settings.streak || 0;
    document.getElementById("streakBadge").textContent = s + "-day streak";
  }
  function renderVersion() {
    const el = document.getElementById("verStamp"); if (el) el.textContent = "v" + APP_VERSION;
    const a = document.getElementById("aboutVersion"); if (a) a.textContent = "Primer v" + APP_VERSION + " · " + concepts.length + " concepts";
    const f = document.getElementById("verFoot"); if (f) f.textContent = "Primer v" + APP_VERSION;
  }

  /* ------------------------------ BOOT ------------------------------------ */
  function wire() {
    document.querySelectorAll(".tabbtn[data-tab]").forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
    document.querySelectorAll(".collapse-head").forEach((h) => {
      h.onclick = () => {
        const body = h.nextElementSibling;
        const opening = body.hasAttribute("hidden");
        if (opening) body.removeAttribute("hidden"); else body.setAttribute("hidden", "");
        h.classList.toggle("open", opening);
      };
    });
    // Adapt the Capture box to whether live AI Capture is enabled (backlog by default).
    const explainBtn = document.getElementById("explainBtn");
    const termInput = document.getElementById("termInput");
    setCapturePlaceholder();
    refreshCaptureUI();
    explainBtn.onclick = submitCapture;
    termInput.addEventListener("input", refreshCaptureUI);
    termInput.addEventListener("keydown", (e) => { if (e.key === "Enter") submitCapture(); });
    document.getElementById("librarySearch").addEventListener("input", renderLibrary);
    document.getElementById("goReviewBtn").onclick = () => setTab("review");
    document.getElementById("overlayBack").onclick = closeOverlay;
    document.getElementById("addReviewBtn").onclick = toggleReview;
    document.getElementById("deleteConceptBtn").onclick = deleteOpen;
    document.getElementById("saveKeyBtn").onclick = () => {
      settings.appKey = document.getElementById("appKeyInput").value.trim(); saveSettings();
      renderMore(); toast("Saved");
    };
    document.getElementById("saveGhBtn").onclick = () => {
      settings.ghToken = document.getElementById("ghTokenInput").value.trim(); saveSettings();
      setCapturePlaceholder(); refreshCaptureUI(); renderMore(); toast("Token saved");
    };
    document.getElementById("exportBtn").onclick = exportBackup;
    document.getElementById("importFile").onchange = (e) => { if (e.target.files[0]) importBackup(e.target.files[0]); };
  }

  function init() {
    load();                       // settings
    const m = mergeSeed();        // concepts (+ any newly pushed content)
    wire();
    renderStreak();
    renderVersion();
    setTab("library");   // "Home" (library) is the default landing tab
    try { console.log("Primer v" + APP_VERSION + " · " + concepts.length + " concepts"); } catch (e) {}
    if (!m.firstRun && m.added) toast(m.added + (m.added === 1 ? " new concept added" : " new concepts added"));
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
