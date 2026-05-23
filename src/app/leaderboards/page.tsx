"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";

type Player = {
  id: string;
  display_name: string;
  kills: number;
  raids: number;
};

export default function LeaderboardsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      const { data, error } = await supabase
        .from("player_profiles")
        .select("*")
        .order("kills", { ascending: false });

      if (!error && data) {
        setPlayers(data);
      }

      setLoading(false);
    }

    fetchPlayers();
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-6xl text-center fade-up">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
            Leaderboards
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase">
            Top Players
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Live leaderboard data powered by Ashfall Reborn profiles.
          </p>

          <div className="mt-12 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
            <div className="grid grid-cols-4 border-b border-zinc-800 bg-zinc-950 p-6 text-sm font-bold uppercase tracking-widest text-orange-500">
              <div>Rank</div>
              <div>Player</div>
              <div>Kills</div>
              <div>Raids</div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-zinc-400">
                Loading leaderboard...
              </div>
            ) : players.length === 0 ? (
              <div className="p-10 text-center text-zinc-400">
                No players found.
              </div>
            ) : (
              players.map((player, index) => (
                <div
                  key={player.id}
                  className="grid grid-cols-4 items-center border-b border-zinc-800 p-6 transition hover:bg-zinc-800/40"
                >
                  <div className="font-black text-orange-500">
                    #{index + 1}
                  </div>

                  <div className="font-bold uppercase">
                    {player.display_name || "Unknown"}
                  </div>

                  <div>{player.kills || 0}</div>

                  <div>{player.raids || 0}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}