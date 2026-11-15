"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";

type PlayerProfile = {
  id: string;
  display_name: string;
  username: string;
  steam_id_public: string;
  avatar_url: string;
  kills: number;
  deaths: number;
  raids: number;
  playtime_minutes: number;
  account_status: string;
  role: string;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      const { data } = await supabase
        .from("player_profiles")
        .select("*")
        .order("kills", { ascending: false });

      if (data) {
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
        <section className="mx-auto max-w-7xl fade-up">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              Community
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase">
              Player Profiles
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
              Browse Ashfall Reborn player profiles, avatars, roles, and future
              stat tracking.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center text-zinc-500">
                Loading players...
              </div>
            ) : players.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
                No player profiles found.
              </div>
            ) : (
              players.map((player) => {
                const name =
                  player.display_name || player.username || "Unknown Player";

                const deaths = player.deaths || 0;
                const kills = player.kills || 0;
                const kd = deaths === 0 ? kills : (kills / deaths).toFixed(2);

                return (
                  <a
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition duration-300 hover:-translate-y-2 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10"
                  >
                    <div className="flex items-center gap-5">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-orange-500/30 bg-orange-500/10 text-4xl font-black text-orange-500">
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
                        <h2 className="text-3xl font-black uppercase group-hover:text-orange-500">
                          {name}
                        </h2>

                        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-orange-500">
                          {player.role || "Player"}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {player.account_status || "active"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl bg-zinc-950 p-4">
                        <p className="text-xs uppercase text-zinc-500">Kills</p>
                        <p className="mt-1 text-2xl font-black">{kills}</p>
                      </div>

                      <div className="rounded-xl bg-zinc-950 p-4">
                        <p className="text-xs uppercase text-zinc-500">K/D</p>
                        <p className="mt-1 text-2xl font-black">{kd}</p>
                      </div>

                      <div className="rounded-xl bg-zinc-950 p-4">
                        <p className="text-xs uppercase text-zinc-500">Raids</p>
                        <p className="mt-1 text-2xl font-black">
                          {player.raids || 0}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </section>
      </main>
    </>
  );
}