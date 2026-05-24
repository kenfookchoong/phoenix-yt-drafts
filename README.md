# Phoenix YT Drafts

Simple web viewer for `out/youtube-upload-details.txt` so I can copy title /
description / tags one at a time from my phone during YouTube upload.

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
