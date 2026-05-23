"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";

type Player = {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  kills: number;
  deaths: number;
  raids: number;
  playtime_minutes: number;
  role: string;
};

type SortType = "kills" | "kd" | "raids" | "playtime";

export default function LeaderboardsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState<SortType>("kills");

  useEffect(() => {
    async function fetchPlayers() {
      const { data } = await supabase
        .from("player_profiles")
        .select("*");

      if (data) {
        setPlayers(data);
      }

      setLoading(false);
    }

    fetchPlayers();
  }, []);

  function getName(player: Player) {
    return player.display_name || player.username || "Unknown Player";
  }

  function getKD(player: Player) {
    const kills = player.kills || 0;
    const deaths = player.deaths || 0;

    if (deaths === 0) return kills;

    return Number((kills / deaths).toFixed(2));
  }

  const sortedPlayers = [...players].sort((a, b) => {
    if (sortType === "kills") {
      return (b.kills || 0) - (a.kills || 0);
    }

    if (sortType === "kd") {
      return getKD(b) - getKD(a);
    }

    if (sortType === "raids") {
      return (b.raids || 0) - (a.raids || 0);
    }

    if (sortType === "playtime") {
      return (b.playtime_minutes || 0) - (a.playtime_minutes || 0);
    }

    return 0;
  });

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-6 py-32 text-white">
        <div className="absolute inset-0">
          <img
            src="https://i.imgur.com/OCzWrRI.png"
            alt="Ashfall Reborn Leaderboards Background"
            className="h-full w-full scale-105 object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-black/85" />
        </div>

        <div className="pointer-events-none absolute left-10 top-32 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 right-10 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

        <section className="relative z-10 mx-auto max-w-7xl fade-up">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              Leaderboards
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase md:text-7xl">
              Top Players
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
              Browse Ashfall Reborn player rankings based on kills, K/D, raids,
              and playtime.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              ["kills", "Top Kills"],
              ["kd", "Best K/D"],
              ["raids", "Most Raids"],
              ["playtime", "Most Playtime"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSortType(value as SortType)}
                className={`rounded-lg px-5 py-3 text-sm font-bold uppercase transition ${
                  sortType === value
                    ? "bg-orange-600 text-white"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-orange-500 hover:text-orange-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 backdrop-blur">
            <div className="grid grid-cols-5 border-b border-zinc-800 bg-zinc-950 p-6 text-sm font-bold uppercase tracking-widest text-orange-500">
              <div>Rank</div>
              <div className="col-span-2">Player</div>
              <div>Stats</div>
              <div>Profile</div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-zinc-400">
                Loading leaderboard...
              </div>
            ) : sortedPlayers.length === 0 ? (
              <div className="p-10 text-center text-zinc-400">
                No player profiles found.
              </div>
            ) : (
              sortedPlayers.map((player, index) => {
                const name = getName(player);
                const kills = player.kills || 0;
                const deaths = player.deaths || 0;
                const raids = player.raids || 0;
                const playtime = player.playtime_minutes || 0;
                const kd = getKD(player);

                return (
                  <div
                    key={player.id}
                    className="grid grid-cols-5 items-center border-b border-zinc-800 p-6 transition hover:bg-zinc-800/40"
                  >
                    <div className="text-3xl font-black text-orange-500">
                      #{index + 1}
                    </div>

                    <div className="col-span-2 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-orange-500/30 bg-orange-500/10 text-2xl font-black text-orange-500">
                        {player.avatar_url ? (
                          <img
                            src={player.avatar_url}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <p className="text-xl font-black uppercase">
                          {name}
                        </p>

                        <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                          {player.role || "Player"}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-zinc-300">
                      <p>
                        <span className="font-bold text-orange-500">
                          Kills:
                        </span>{" "}
                        {kills}
                      </p>

                      <p>
                        <span className="font-bold text-orange-500">
                          Deaths:
                        </span>{" "}
                        {deaths}
                      </p>

                      <p>
                        <span className="font-bold text-orange-500">
                          K/D:
                        </span>{" "}
                        {kd}
                      </p>

                      <p>
                        <span className="font-bold text-orange-500">
                          Raids:
                        </span>{" "}
                        {raids}
                      </p>

                      <p>
                        <span className="font-bold text-orange-500">
                          Playtime:
                        </span>{" "}
                        {Math.floor(playtime / 60)}h
                      </p>
                    </div>

                    <div>
                      <a
                        href={`/players/${player.id}`}
                        className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-bold uppercase transition hover:bg-orange-700"
                      >
                        View
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </>
  );
}