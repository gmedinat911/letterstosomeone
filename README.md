# Letters to Someone — Wood

Standalone birthday microsite on Netlify. The letter is **not shipped to the browser until the recipient opens it**. The access link may be opened by one browser session for 15 minutes. A server-side Upstash Redis atomic SET NX permanently records the first claim; later sessions are rejected. Opening is irreversible.

## Setup (required before sharing)

1. Deploy this repository as a Netlify site (publish directory `.`, functions `netlify/functions`).
2. Create an Upstash Redis database and obtain its REST URL and REST token.
3. In Netlify environment variables set `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
4. Generate a random secret (e.g. `openssl rand -hex 32`) and set it as `LETTER_ACCESS_KEY`. Do not commit it. The QR URL is `https://YOUR-DOMAIN/?key=YOUR_SECRET`.
5. Set `LETTER_BODY_BASE64` to the base64 encoding of the **exact final letter text**, UTF-8. For example, store the letter in a local file and run `base64 < wood.txt | tr -d '\\n'` on macOS/Linux. Do not commit the letter.
6. Deploy and verify on a *test key* before issuing the real QR. Use a separate test Redis database/key or change the access key after testing. Opening the real URL claims it permanently.
7. Generate the QR from the final URL. Keep the URL secret until gifting.

## Limitations / important warnings

- **This repository was initially public and an earlier commit included the entire letter in `app.js`.** Removing it from the latest revision does **not** erase Git history, forks, caches, or clones. Treat this repository as compromised for confidentiality. For actual privacy, create a **fresh private repository** with clean history before deployment and do not publish the old repository. A private repository can still deploy to Netlify.
- The first person/bot to *press Open* with the secret claims the letter. Link preview bots loading the page without pressing Open do not claim it. Do not share the link before gifting.
- This prevents another browser from opening the letter after claim; the same browser session can reload during the 15-minute window. After expiry the server refuses it. It does **not** prevent screenshots, screen recording, photos, browser devtools, or copies during the reading window. Nor can it remotely erase content already captured.
- The letter is returned to the browser during the reading window, so network/browser tools can save it.
- The countdown uses the browser clock for display; server-side expiration is enforced on every open request. If the browser clock is wrong the displayed timer can be inaccurate.
- Redis data must persist indefinitely (do not reset/delete the claim key) to enforce permanent one-time consumption. Back up and protect your datastore.
