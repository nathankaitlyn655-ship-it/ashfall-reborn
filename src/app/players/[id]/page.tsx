"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabaseClient";

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
  created_at: string;
};

export default function PlayerProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayer() {
      const { data } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      setPlayer(data);
      setLoading(false);
    }

    if (id) {
      fetchPlayer();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading player profile...
      </main>
    );
  }

  if (!player) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <h1 className="text-4xl font-black uppercase text-orange-500">
              Player Not Found
            </h1>

            <p className="mt-4 text-zinc-400">
              This player profile does not exist.
            </p>

            <a
              href="/players"
              className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-3 font-bold uppercase transition hover:bg-orange-700"
            >
              Back To Players
            </a>
          </div>
        </main>
      </>
    );
  }

  const name = player.display_name || player.username || "Unknown Player";
  const kills = player.kills || 0;
  const deaths = player.deaths || 0;
  const raids = player.raids || 0;
  const playtime = player.playtime_minutes || 0;
  const kd = deaths === 0 ? kills : (kills / deaths).toFixed(2);

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-6 py-32 text-white">
        <div className="absolute inset-0">
          <img
            src="https://i.imgur.com/OCzWrRI.png"
            alt="Ashfall Reborn Player Background"
            className="h-full w-full scale-105 object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-black/85" />
        </div>

        <div className="pointer-events-none absolute left-10 top-32 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 right-10 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

        <section className="relative z-10 mx-auto max-w-7xl fade-up">
          <a
            href="/players"
            className="mb-8 inline-block text-sm font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400"
          >
            ← Back To Players
          </a>

          <div className="overflow-hidden rounded-[2rem] border border-orange-500/20 bg-zinc-900/90 shadow-2xl shadow-orange-500/10 backdrop-blur">
            <div className="relative p-10">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-3xl border border-orange-500/40 bg-orange-500/10 text-7xl font-black text-orange-500">
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
                    <p className="text-sm font-bold uppercase tracking-[0.4em] text-orange-500">
                      Player Profile
                    </p>

                    <h1 className="mt-3 text-5xl font-black uppercase md:text-7xl">
                      {name}
                    </h1>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="rounded-lg bg-orange-500/10 px-4 py-2 text-sm font-bold uppercase text-orange-500">
                        {player.role || "Player"}
                      </span>

                      <span className="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-bold uppercase text-green-400">
                        {player.account_status || "active"}
                      </span>

                      <span className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-bold uppercase text-zinc-400">
                        {player.steam_id_public ? "Steam Linked" : "Steam Not Linked"}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href="/leaderboards"
                  className="rounded-xl bg-orange-600 px-6 py-4 text-center font-black uppercase transition hover:bg-orange-700"
                >
                  View Leaderboards
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              ["Kills", kills],
              ["Deaths", deaths],
              ["K/D", kd],
              ["Raids", raids],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 text-center backdrop-blur transition hover:-translate-y-2 hover:border-orange-500"
              >
                <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                  {label}
                </p>

                <p className="mt-3 text-5xl font-black">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 backdrop-blur lg:col-span-2">
              <h2 className="text-3xl font-black uppercase text-orange-500">
                Player Information
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-zinc-950 p-5">
                  <p className="text-sm uppercase tracking-widest text-zinc-500">
                    Display Name
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {name}
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-5">
                  <p className="text-sm uppercase tracking-widest text-zinc-500">
                    Steam
                  </p>
                  <p className="mt-2 break-all text-xl font-bold">
                    {player.steam_id_public || "Not linked"}
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-5">
                  <p className="text-sm uppercase tracking-widest text-zinc-500">
                    Playtime
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {Math.floor(playtime / 60)}h {playtime % 60}m
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-5">
                  <p className="text-sm uppercase tracking-widest text-zinc-500">
                    Joined
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {player.created_at
                      ? new Date(player.created_at).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 backdrop-blur">
              <h2 className="text-3xl font-black uppercase text-orange-500">
                Quick Links
              </h2>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href="/players"
                  className="rounded-xl bg-zinc-950 px-5 py-4 font-bold uppercase transition hover:bg-zinc-800"
                >
                  All Players
                </a>

                <a
                  href="/leaderboards"
                  className="rounded-xl bg-zinc-950 px-5 py-4 font-bold uppercase transition hover:bg-zinc-800"
                >
                  Leaderboards
                </a>

                <a
                  href="/support"
                  className="rounded-xl bg-zinc-950 px-5 py-4 font-bold uppercase transition hover:bg-zinc-800"
                >
                  Support
                </a>

                <a
                  href="steam://connect/198.73.57.143:28025"
                  className="rounded-xl bg-orange-600 px-5 py-4 text-center font-bold uppercase transition hover:bg-orange-700"
                >
                  Connect To Server
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}