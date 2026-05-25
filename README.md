# Phoenix YT Drafts

Simple web viewer for `out/youtube-upload-details.txt` so I can copy title /
description / tags one at a time from my phone during YouTube upload.

Edits (title/description/tags overrides + "posted" toggle) sync across
devices via Supabase.

## First-time setup (Supabase)

1. Create a free Supabase project at https://supabase.com
2. Open **SQL Editor** → paste the contents of `SUPABASE_SETUP.sql` → Run
3. Open **Project Settings → API** → copy the **URL** and **anon public** key
4. Save them locally:
   ```bash
   cp .env.example .env.local
   # edit .env.local — paste the two values
   ```
5. On Netlify (Site → Settings → Environment variables), add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Trigger a Netlify deploy so the env vars get baked into the build.

Missing env vars? The site falls back to localStorage-only mode (no sync).

## Local dev

```bash
npm install
npm run dev    # http://localhost:5173
```

`npm run dev` first runs `scripts/parse-txt.mjs`, which reads
`../out/youtube-upload-details.txt` (the parent project's YT draft file) and
writes `src/data/videos.json`.

## Adding new videos

The parent Remotion project's `render-lean.mjs` automatically calls this
project's `parse-txt.mjs` after every render — so `src/data/videos.json`
stays fresh. Then:

```bash
git add src/data/videos.json
git commit -m "sync videos"
git push
```

Netlify auto-deploys on push.

## Password

Soft gate in `src/components/PasswordGate.tsx`. Change the `PASSWORD`
constant + redeploy.

## Build

```bash
npm run build  # parse + tsc + vite → dist/
```
