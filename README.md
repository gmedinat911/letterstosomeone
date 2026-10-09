# A letter for someone

A standalone birthday-letter microsite. Opening the letter begins a **15-minute device-local reading window** stored in localStorage.

## Important privacy limitation
This static version is **not genuinely one-time or secure**. Clearing browser storage, opening another device, viewing public repository source, or accessing the deployed JavaScript can reveal the letter again. A real one-time URL requires a backend/edge function plus persistent shared storage and private letter content stored outside public Git history. A browser cannot prevent screenshots, recording, copying, or photos.

Do not send the QR code until server-side token revocation has been added and tested if strict one-time access is essential. If hosted on Netlify, use Netlify Functions and a durable datastore (e.g., Neon/Supabase/Redis with atomic claiming); store the letter outside the public repository.

Once you know the final deployed URL, generate a QR code pointing to it. Do not print a QR based on a provisional domain.
