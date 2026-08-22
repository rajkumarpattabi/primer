// Primer configuration.
// NOTHING here is a secret. Your API key / GitHub token live ONLY on the device
// (localStorage) or in the Cloudflare Worker — never in this repo.
//
// WORKER_URL:  (optional, backlog) base URL of a Cloudflare Worker for live AI
//   Capture. Leave "" to keep AI Capture off.
// GH_OWNER / GH_REPO / GH_BRANCH:  where the in-app "Queue to git" capture writes
//   its inbox files. Not secret — the write token is entered in the app and kept
//   only on the phone.
window.PRIMER_CONFIG = {
  WORKER_URL: "",
  GH_OWNER: "rajkumarpattabi",
  GH_REPO: "primer",
  GH_BRANCH: "main"
};
