import { useState, useRef, useEffect } from "react";

type Props = {
  label: string;
  icon: string;
  value: string;
  onChange: (next: string) => void;
  multiline?: boolean;
  originalValue: string;
};

export const CopyableField: React.FC<Props> = ({
  label,
  icon,
  value,
  onChange,
  multiline,
  originalValue,
}) => {
  const [editing, setEditing] = useState(false);
  // Local buffer while editing — only committed to the parent (and Supabase)
  // when the user clicks Save. Prevents a write on every keystroke.
  const [draft, setDraft] = useState(value);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDirty = value !== originalValue;

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const save = () => {
    if (draft !== value) onChange(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editing]);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-white/60">
          {icon} {label}
          {isDirty && (
            <span className="ml-2 text-[color:var(--color-ember)]">●</span>
          )}
          {editing && (
            <span className="ml-2 text-[color:var(--color-fire)]">editing…</span>
          )}
        </span>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={save}
                className="rounded-md bg-green-500 px-3 py-1 text-xs font-bold text-black transition hover:bg-green-400"
              >
                Save
              </button>
              <button
                onClick={cancel}
                className="rounded-md border border-white/15 px-3 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/10"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEdit}
                className="rounded-md border border-white/15 px-3 py-1 text-xs font-semibold transition hover:bg-white/10"
              >
                Edit
              </button>
              {isDirty && (
                <button
                  onClick={() => onChange(originalValue)}
                  className="rounded-md border border-white/15 px-3 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/10"
                  title="Revert to original"
                >
                  ↺
                </button>
              )}
              <button
                onClick={copy}
                className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                  copied
                    ? "bg-green-500 text-black"
                    : "bg-[color:var(--color-fire)] text-black hover:bg-[color:var(--color-ember)]"
                }`}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            // Esc cancels, Ctrl/Cmd+Enter saves.
            if (e.key === "Escape") cancel();
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") save();
          }}
          className="w-full resize-none rounded-lg border border-[color:var(--color-fire)] bg-black/60 px-3 py-2 font-mono text-sm leading-relaxed outline-none"
        />
      ) : (
        <div
          onClick={startEdit}
          className={`whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm leading-relaxed cursor-text ${
            multiline ? "" : "truncate"
          }`}
        >
          {value || (
            <span className="text-white/30 italic">empty — click to edit</span>
          )}
        </div>
      )}
    </div>
  );
};
