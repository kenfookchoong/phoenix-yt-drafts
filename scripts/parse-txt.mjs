#!/usr/bin/env node
// Parse ../out/youtube-upload-details.txt into a typed JSON the React app
// consumes. Re-run on every render via `npm run sync` (or `dev`/`build`).
//
// The txt format is loose — each video block starts after a `===` rule,
// followed by an emoji header, then 📌 TITLE / 📝 DESCRIPTION / 🏷️ TAGS.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("..");
const TXT = path.join(ROOT, "out", "youtube-upload-details.txt");
const OUT = path.resolve("src/data/videos.json");

if (!fs.existsSync(TXT)) {
  // On Netlify (CI) the parent's `out/` isn't present — that's expected.
  // Keep whatever videos.json was committed; do NOT wipe to [].
  if (fs.existsSync(OUT)) {
    console.log(`ℹ Source txt missing — keeping committed ${path.relative(process.cwd(), OUT)}`);
    process.exit(0);
  }
  console.warn(`✗ Source txt not found and no committed JSON either. Writing [].`);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, "[]");
  process.exit(0);
}

const raw = fs.readFileSync(TXT, "utf8");

// Find every VIDEO header occurrence, then slice the content between this
// header and the next (or the 📊 NOTES section / EOF). The txt's `===` rule
// lines make naive split-by-`===` unreliable since each header is wrapped
// in two rules.
const headerRe =
  /🎬\s*VIDEO\s+([\w]+)\s*—\s*([\s\S]+?)\s*\(([^)]+\.mp4)\)/g;
const matches = [...raw.matchAll(headerRe)];

// Find where NOTES section starts so we don't drift into it.
const notesIdx = raw.search(/📊\s*NOTES/);

const videos = [];

for (let i = 0; i < matches.length; i++) {
  const m = matches[i];
  const [, number, name, filename] = m;
  const start = m.index + m[0].length;
  const next = matches[i + 1];
  let end = next ? next.index : raw.length;
  if (notesIdx >= 0 && notesIdx > start && notesIdx < end) end = notesIdx;
  const block = raw.slice(start, end);

  const titleMatch = block.match(/📌\s*TITLE:\s*\n([\s\S]*?)(?=\n\s*\n|📝)/);
  const descMatch = block.match(
    /📝\s*DESCRIPTION:\s*\n([\s\S]*?)(?=🏷️\s*TAGS:|⚠️\s*AUTO)/,
  );
  const tagsMatch = block.match(/🏷️\s*TAGS:\s*\n([\s\S]*?)(?=⚠️|\n=+|$)/);

  const title = (titleMatch?.[1] ?? "").trim();
  const description = (descMatch?.[1] ?? "")
    .replace(/⚠️[\s\S]*$/, "")
    .trim();
  const tags = (tagsMatch?.[1] ?? "")
    .replace(/⚠️[\s\S]*$/, "")
    .replace(/\n=+\s*$/g, "")
    .trim();

  const enemyMatch = description.match(
    /(?:👹\s*Enemy:|🐻\s*Enemy:|🔥\s*Enemy:|🌳\s*Enemy:)\s*([^\n]+)/,
  );
  const enemy = enemyMatch ? enemyMatch[1].trim() : null;

  const id = filename.replace(/\.mp4$/i, "");

  videos.push({
    id,
    number,
    name: name.trim(),
    filename,
    title,
    description,
    tags,
    enemy,
  });
}

// Newest first
videos.reverse();

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(videos, null, 2));
console.log(
  `✓ ${videos.length} videos → ${path.relative(process.cwd(), OUT)}`,
);
