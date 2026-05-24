import { useEffect, useState } from "react";
import type { Video } from "../types";
import { CopyableField } from "./CopyableField";

const STORAGE_PREFIX = "yt-site:edit:";
const POSTED_PREFIX = "yt-site:posted:";

const loadEdit = (id: string): Partial<Video> => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveEdit = (id: string, edits: Partial<Video>) => {
  if (
    !edits.title &&
    !edits.description &&
    !edits.tags
  ) {
    localStorage.removeItem(STORAGE_PREFIX + id);
    return;
  }
  localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(edits));
};

export const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
  const [edits, setEdits] = useState<Partial<Video>>(() => loadEdit(video.id));
  const [posted, setPosted] = useState(
    () => localStorage.getItem(POSTED_PREFIX + video.id) === "1",
  );

  const title = edits.title ?? video.title;
  const description = edits.description ?? video.description;
  const tags = edits.tags ?? video.tags;

  useEffect(() => {
    saveEdit(video.id, edits);
  }, [edits, video.id]);

  const togglePosted = () => {
    const next = !posted;
    setPosted(next);
    if (next) {
      localStorage.setItem(POSTED_PREFIX + video.id, "1");
    } else {
      localStorage.removeItem(POSTED_PREFIX + video.id);
    }
  };

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white/[0.03] transition ${
        posted
          ? "border-green-500/30 opacity-60"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/30 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white/50">
            VIDEO {video.number} {video.enemy && `· vs ${video.enemy}`}
          </div>
          <div className="truncate font-bold text-white">{video.name}</div>
          <div className="truncate text-xs text-white/40">
            {video.filename}
          </div>
        </div>
        <button
          onClick={togglePosted}
          className={`shrink-0 rounded-md px-3 py-1 text-xs font-bold transition ${
            posted
              ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
              : "border border-white/15 text-white/70 hover:bg-white/10"
          }`}
        >
          {posted ? "✓ Posted" : "Mark posted"}
        </button>
      </header>
      <div className="space-y-4 p-4">
        <CopyableField
          label="Title"
          icon="📌"
          value={title}
          originalValue={video.title}
          onChange={(v) => setEdits({ ...edits, title: v })}
        />
        <CopyableField
          label="Description"
          icon="📝"
          value={description}
          originalValue={video.description}
          onChange={(v) => setEdits({ ...edits, description: v })}
          multiline
        />
        <CopyableField
          label="Tags"
          icon="🏷️"
          value={tags}
          originalValue={video.tags}
          onChange={(v) => setEdits({ ...edits, tags: v })}
          multiline
        />
      </div>
    </article>
  );
};
