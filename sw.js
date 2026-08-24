/* ============================================================================
 * Primer — sw.js (service worker: offline support + update strategy)
 * ----------------------------------------------------------------------------
 * Registered by app.js. Precaches the app shell so Primer opens with no
 * network, and controls how updates reach the device:
 *   • App shell (html/css/js/json/md): NETWORK-FIRST — fetch the latest when
 *     online, fall back to cache when offline. A fresh deploy shows up on the
 *     next open once you're online.
 *   • Everything else (icons): CACHE-FIRST — rarely changes.
 * The AI-Capture requests to your Cloudflare Worker are cross-origin and are
 * left to go straight to the network (never cached).
 * Bump CACHE_NAME on every deploy so the new worker replaces the old cache.
 * ==========================================================================*/
const CACHE_NAME = "primer-v24";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./concepts.js",
  "./config.js",
  "./README.md",
  "./manifest.json",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only handle same-origin GETs. Cross-origin (the AI Worker) goes to network.
  if (url.origin !== self.location.origin) return;

  const isShell =
    req.mode === "navigate" ||
    /\.(?:html|css|js|json|md)$/.test(url.pathname);

  if (isShell) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
  } else {
    event.respondWith(caches.match(req).then((c) => c || fetch(req)));
  }
});
