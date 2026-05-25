import { useMemo, useState } from "react";
import videosData from "./data/videos.json";
import type { Video } from "./types";
import { PasswordGate } from "./components/PasswordGate";
import { VideoCard } from "./components/VideoCard";
import { DraftsProvider, useDrafts } from "./lib/drafts";

const videos = videosData as Video[];

export const App: React.FC = () => (
  <PasswordGate>
    <DraftsProvider>
      <Home />
    </DraftsProvider>
  </PasswordGate>
);

const Home: React.FC = () => {
  const [query, setQuery] = useState("");
  const [enemy, setEnemy] = useState<string>("all");
  const [hidePosted, setHidePosted] = useState(false);
  const { drafts } = useDrafts();

  const enemies = useMemo(() => {
    const set = new Set<string>();
    for (const v of videos) if (v.enemy) set.add(v.enemy);
    return ["all", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      if (enemy !== "all" && v.enemy !== enemy) return false;
      if (hidePosted && drafts[v.id]?.posted_at) return false;
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        v.tags.toLowerCase().includes(q) ||
        v.filename.toLowerCase().includes(q)
      );
    });
  }, [query, enemy, hidePosted, drafts]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-24">
      <header className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[color:var(--color-fire)]">
            🐦‍🔥 Phoenix YT Drafts
          </h1>
          <span className="text-xs text-white/40">
            {filtered.length} / {videos.length}
          </span>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, hero, tags, filename..."
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm outline-none focus:border-[color:var(--color-fire)]"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={enemy}
            onChange={(e) => setEnemy(e.target.value)}
            className="rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-sm outline-none"
          >
            {enemies.map((e) => (
              <option key={e} value={e}>
                {e === "all" ? "All enemies" : e}
              </option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-sm">
            <input
              type="checkbox"
              checked={hidePosted}
              onChange={(e) => setHidePosted(e.target.checked)}
            />
            Hide posted
          </label>
        </div>
      </header>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-black/40 p-6 text-center text-white/50">
          No matches.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}

      <footer className="pt-10 text-center text-xs text-white/30">
        edits sync across devices via Supabase · rebuild + redeploy to refresh
        draft source
      </footer>
    </div>
  );
};
