import { useState } from "react";

// Soft gate so randos who stumble on the URL don't see drafts. The actual
// site/data is public — this is a UX gate, not real security.
const PASSWORD = "phoenix";
const STORAGE_KEY = "yt-site:authed";

export const PasswordGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "1",
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (authed) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim().toLowerCase() === PASSWORD) {
            localStorage.setItem(STORAGE_KEY, "1");
            setAuthed(true);
          } else {
            setError(true);
          }
        }}
        className="w-full max-w-sm space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur"
      >
        <h1 className="text-2xl font-black text-[color:var(--color-fire)]">
          🐦‍🔥 Phoenix YT
        </h1>
        <p className="text-sm text-white/70">
          Enter password to view drafts.
        </p>
        <input
          autoFocus
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-base outline-none focus:border-[color:var(--color-fire)]"
          placeholder="password"
        />
        {error && (
          <p className="text-sm text-red-400">Nope. Try again.</p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-[color:var(--color-fire)] px-4 py-3 font-bold text-black transition hover:bg-[color:var(--color-ember)]"
        >
          Enter
        </button>
      </form>
    </div>
  );
};
