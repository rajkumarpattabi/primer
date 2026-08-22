// Primer configuration.
// NOTHING here is a secret. Your LLM API key lives ONLY in the Cloudflare Worker
// (as an encrypted Worker secret), never in this repo and never on the phone.
//
// WORKER_URL: the base URL of your deployed Cloudflare Worker that generates
//   explanations. Leave it blank ("") to run Primer in fully-offline, manual
//   mode (you type explanations yourself; no AI Capture, no network, no key).
//
// After you deploy the Worker (see worker/ and the README), paste its URL below.
window.PRIMER_CONFIG = {
  WORKER_URL: ""   // e.g. "https://primer.rajkumar-com.workers.dev"
};
