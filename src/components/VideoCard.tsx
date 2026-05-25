import type { Video } from "../types";
import { CopyableField } from "./CopyableField";
import { useDraftFor } from "../lib/drafts";

export const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
  const { draft, update } = useDraftFor(video.id);

  const title = draft.title_override ?? video.title;
  const description = draft.description_override ?? video.description;
  const tags = draft.tags_override ?? video.tags;
  const musicCredit = draft.music_credit ?? "";
  const posted = !!draft.posted_at;

  const togglePosted = () => {
    update({ posted_at: posted ? null : new Date().toISOString() });
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
          onChange={(v) =>
            update({ title_override: v === video.title ? null : v })
          }
        />
        <CopyableField
          label="Description"
          icon="📝"
          value={description}
          originalValue={video.description}
          onChange={(v) =>
            update({ description_override: v === video.description ? null : v })
          }
          multiline
        />
        <CopyableField
          label="Tags"
          icon="🏷️"
          value={tags}
          originalValue={video.tags}
          onChange={(v) =>
            update({ tags_override: v === video.tags ? null : v })
          }
          multiline
        />
        <CopyableField
          label="Music Credit"
          icon="🎵"
          value={musicCredit}
          originalValue=""
          onChange={(v) => update({ music_credit: v.trim() === "" ? null : v })}
          multiline
        />
      </div>
    </article>
  );
};
