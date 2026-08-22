# Primer capture inbox (folder queue)

Each file in this folder is one captured term (or a few, one per line), dropped
here from the phone by the "Add to Primer" Apple Shortcut — a single GitHub API
call, no research needed. The term name is enough.

On the laptop, `/primer-add` (or "drain the Primer inbox") reads every capture
file here plus `../inbox.md`, turns each term into a full concept in
`concepts.js`, then clears the queue. Files here are safe to delete anytime.
