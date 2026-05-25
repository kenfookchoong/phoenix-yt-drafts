import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";

export type Draft = {
  id: string;
  title_override?: string | null;
  description_override?: string | null;
  tags_override?: string | null;
  music_credit?: string | null;
  posted_at?: string | null;
};

const LS_KEY = "yt-site:drafts:v1";

const loadLocal = (): Record<string, Draft> => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const saveLocal = (drafts: Record<string, Draft>) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(drafts));
  } catch {}
};

type DraftsContextValue = {
  drafts: Record<string, Draft>;
  updateDraft: (id: string, patch: Partial<Omit<Draft, "id">>) => void;
};

const DraftsContext = createContext<DraftsContextValue | null>(null);

export const DraftsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => loadLocal());

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let cancelled = false;

    client
      .from("drafts")
      .select("*")
      .then(({ data, error }) => {
        if (cancelled || error || !data) {
          if (error) console.error("[drafts] initial fetch", error);
          return;
        }
        const next: Record<string, Draft> = {};
        for (const d of data as Draft[]) next[d.id] = d;
        setDrafts(next);
        saveLocal(next);
      });

    const channel = client
      .channel("drafts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "drafts" },
        (payload) => {
          setDrafts((prev) => {
            const next = { ...prev };
            if (payload.eventType === "DELETE" && payload.old) {
              delete next[(payload.old as Draft).id];
            } else if (payload.new) {
              const d = payload.new as Draft;
              next[d.id] = d;
            }
            saveLocal(next);
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      client.removeChannel(channel);
    };
  }, []);

  const updateDraft = useCallback(
    (id: string, patch: Partial<Omit<Draft, "id">>) => {
      setDrafts((prev) => {
        const merged: Draft = { ...prev[id], ...patch, id };
        const next = { ...prev, [id]: merged };
        saveLocal(next);
        const client = supabase;
        if (client) {
          client
            .from("drafts")
            .upsert(merged)
            .then(({ error }) => {
              if (error) console.error("[drafts] upsert failed", error);
            });
        }
        return next;
      });
    },
    [],
  );

  return (
    <DraftsContext.Provider value={{ drafts, updateDraft }}>
      {children}
    </DraftsContext.Provider>
  );
};

export function useDrafts() {
  const ctx = useContext(DraftsContext);
  if (!ctx) throw new Error("useDrafts must be used inside DraftsProvider");
  return ctx;
}

export function useDraftFor(id: string) {
  const { drafts, updateDraft } = useDrafts();
  const draft = drafts[id] ?? ({ id } as Draft);
  return {
    draft,
    update: (patch: Partial<Omit<Draft, "id">>) => updateDraft(id, patch),
  };
}
