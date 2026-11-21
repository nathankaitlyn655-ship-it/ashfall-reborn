"use client";

import { useEffect, useState } from "react";

type Entry = { name: string; value: number; members?: number };
type Boards = { pvp: Entry[]; sulfur: Entry[]; clans: Entry[] };

export default function GameLeaderboard() {
  const [boards, setBoards] = useState<Boards | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const result = await fetch("/api/live-snapshot", { cache: "no-store" });
        if (!result.ok) throw new Error("Leaderboard data unavailable");
        const data = await result.json();
        if (!active) return;
        setConnected(!!data.connected);
        setBoards(data.leaderboards || null);
      } catch {
        if (active) { setConnected(false); setBoards(null); }
      }
    }
    void refresh();
    const interval = setInterval(refresh, 60000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const categories: Array<{ key: keyof Boards; label: string; unit: string }> = [
    { key: "pvp", label: "PvP Kills", unit: "kills" },
    { key: "sulfur", label: "Sulfur Mined", unit: "sulfur" },
    { key: "clans", label: "Top Clans", unit: "kills" },
  ];

  return (
    <section className="mt-8 rounded-3xl border border-orange-500/30 bg-zinc-900/90 p-6 md:p-9">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Official Prize Standings</p>
        <h2 className="mt-3 text-3xl font-black uppercase">In-Game Wipe Leaderboard</h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-zinc-400">These standings will be synced from the Rust leaderboard plugin. Wipe prizes are based on verified in-game results, not website account profiles.</p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {categories.map(({ key, label, unit }) => (
          <div key={key} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h3 className="mb-5 text-center text-lg font-black uppercase text-orange-500">{label}</h3>
            {boards ? (
              boards[key].length ? (
                <ol className="space-y-3">
                  {boards[key].slice(0, 5).map((entry, index) => (
                    <li key={`${entry.name}-${index}`} className="flex justify-between gap-2 border-b border-zinc-800 pb-2 text-sm">
                      <span className="truncate text-zinc-200"><strong className="mr-2 text-orange-500">#{index + 1}</strong>{entry.name}</span>
                      <span className="shrink-0 text-zinc-400">{entry.value.toLocaleString()} {unit}</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="text-center text-sm text-zinc-500">No recorded results yet.</p>
            ) : (
              <p className="text-center text-sm leading-6 text-zinc-500">{connected ? "Waiting for the leaderboard plugin to publish rankings." : "Live leaderboard sync is not connected yet."}</p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-zinc-400">Until synchronization is configured, use <strong>/leaderboard</strong> in Rust for the current official standings.</p>
    </section>
  );
}
