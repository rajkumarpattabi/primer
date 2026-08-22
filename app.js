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
  let settings = { appKey: "", streak: 0, lastStudy: "" };

  const WORKER_URL = (window.PRIMER_CONFIG && window.PRIMER_CONFIG.WORKER_URL || "").replace(/\/+$/, "");

  // Version stamp — BUMP THIS on each release so a device shows which build it runs.
  const APP_VERSION = "1.1.3";

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
    if (!settings.appKey) { openSettings(); toast("Enter your app pass-phrase first."); return; }

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

  // Route the Capture box: live AI if a Worker is configured, else quick-find.
  function submitCapture() { return WORKER_URL ? doExplain() : doFind(); }

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
    const order = ["Data platforms", "Governance", "AI models", "AI applications", "Ways of working", "Concepts"];
    const themes = Object.keys(groups).sort((a, b) => {
      const ia = order.indexOf(a), ib = order.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    const now = Date.now();
    themes.forEach((theme) => {
      const h = document.createElement("div"); h.className = "theme-head"; h.textContent = theme;
      h.style.color = themeColor(theme);
      list.appendChild(h);
      groups[theme].sort((a, b) => a.term.localeCompare(b.term)).forEach((c) => {
        const isDue = c.inReview && c.cards.some((cd) => cd.srs.due <= now);
        const row = document.createElement("div");
        row.className = "card concept-row";
        row.style.borderLeftColor = themeColor(c.theme);
        row.innerHTML =
          '<div class="meta"><div class="term">' + escapeHtml(c.term) + '</div>' +
          '<div class="ol">' + escapeHtml(c.oneLiner || "") + '</div></div>' +
          (isDue ? '<span class="due-dot" title="due for review"></span>' : "");
        row.onclick = () => openConcept(c.id);
        list.appendChild(row);
      });
    });
  }

  /* ------------------------------ MAP ------------------------------------- */
  let mapHi = null;   // currently highlighted concept id
  function renderMap() {
    const canvas = document.getElementById("mapCanvas");
    canvas.innerHTML = "";
    document.getElementById("mapEmpty").hidden = concepts.length > 0;

    const groups = {};
    concepts.forEach((c) => { (groups[c.theme] = groups[c.theme] || []).push(c); });
    const order = ["Data platforms", "Governance", "AI models", "AI applications", "Ways of working", "Concepts"];
    const themes = Object.keys(groups).sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));

    // links list for the highlighted node
    const hi = mapHi ? findConcept(mapHi) : null;
    if (hi) {
      const linkNames = new Set((hi.connects || []).map((t) => t.toLowerCase()));
      // also include concepts that link TO this one
      concepts.forEach((c) => { if ((c.connects || []).some((t) => t.toLowerCase() === hi.term.toLowerCase())) linkNames.add(c.term.toLowerCase()); });
      const box = document.createElement("div"); box.className = "map-links";
      const links = (hi.connects || []);
      box.innerHTML = "<b style='color:var(--teal)'>" + escapeHtml(hi.term) + "</b> connects to: " +
        (links.length ? links.map(escapeHtml).join(" · ") : "—") + ".";
      canvas.appendChild(box);
      var highlightSet = linkNames;
      var hiTerm = hi.term.toLowerCase();
    }

    themes.forEach((theme) => {
      const g = document.createElement("div"); g.className = "map-group";
      const h = document.createElement("div"); h.className = "theme-head"; h.textContent = theme;
      h.style.color = themeColor(theme);
      g.appendChild(h);
      groups[theme].sort((a, b) => a.term.localeCompare(b.term)).forEach((c) => {
        const node = document.createElement("span");
        node.className = "map-node";
        const col = themeColor(c.theme);
        if (hi) {
          if (c.term.toLowerCase() === hiTerm) { node.classList.add("hi"); node.style.background = col; node.style.borderColor = col; }
          else if (highlightSet.has(c.term.toLowerCase())) { node.classList.add("linked"); node.style.color = col; node.style.borderColor = col; }
        }
        node.textContent = c.term;
        node.onclick = () => { mapHi = (mapHi === c.id ? null : c.id); renderMap(); };
        g.appendChild(node);
      });
      canvas.appendChild(g);
    });
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
  function openSettings() {
    const status = document.getElementById("aiStatus");
    if (!WORKER_URL) status.textContent = "not configured — offline manual mode";
    else if (!settings.appKey) status.textContent = "Worker set — enter pass-phrase below";
    else status.textContent = "ready";
    document.getElementById("appKeyInput").value = settings.appKey || "";
    renderVersion();
    document.getElementById("settingsSheet").hidden = false;
  }
  function closeSettings() { document.getElementById("settingsSheet").hidden = true; }

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
        toast("Backup imported"); closeSettings(); renderCapture(); renderStreak();
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
    document.getElementById("settingsBtn").onclick = openSettings;
    // Adapt the Capture box to whether live AI Capture is enabled (backlog by default).
    const explainBtn = document.getElementById("explainBtn");
    const termInput = document.getElementById("termInput");
    if (WORKER_URL) { explainBtn.textContent = "Explain & save"; termInput.placeholder = "Type any term you heard…"; }
    else { explainBtn.textContent = "Find"; termInput.placeholder = "Find a concept…"; }
    explainBtn.onclick = submitCapture;
    termInput.addEventListener("keydown", (e) => { if (e.key === "Enter") submitCapture(); });
    document.getElementById("librarySearch").addEventListener("input", renderLibrary);
    document.getElementById("goReviewBtn").onclick = () => setTab("review");
    document.getElementById("overlayBack").onclick = closeOverlay;
    document.getElementById("addReviewBtn").onclick = toggleReview;
    document.getElementById("deleteConceptBtn").onclick = deleteOpen;
    document.getElementById("settingsBack").onclick = closeSettings;
    document.getElementById("saveKeyBtn").onclick = () => {
      settings.appKey = document.getElementById("appKeyInput").value.trim(); saveSettings();
      openSettings(); toast("Saved");
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
    renderCapture();
    try { console.log("Primer v" + APP_VERSION + " · " + concepts.length + " concepts"); } catch (e) {}
    if (!m.firstRun && m.added) toast(m.added + (m.added === 1 ? " new concept added" : " new concepts added"));
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
