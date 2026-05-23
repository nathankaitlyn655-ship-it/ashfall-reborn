"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type OnlinePlayer = {
  steam_id: string;
  display_name: string;
  last_seen: string;
};

type KillfeedItem = {
  id: string;
  killer_name: string;
  victim_name: string;
  death_type: string;
  created_at: string;
};

export default function LiveActivity() {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [killfeed, setKillfeed] = useState<KillfeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveActivity();

    const interval = setInterval(fetchLiveActivity, 30000);

    return () => clearInterval(interval);
  }, []);

  async function fetchLiveActivity() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: onlineData } = await supabase
      .from("online_players")
      .select("*")
      .gte("last_seen", fiveMinutesAgo)
      .order("display_name", { ascending: true });

    const { data: killfeedData } = await supabase
      .from("killfeed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    setOnlinePlayers(onlineData || []);
    setKillfeed(killfeedData || []);
    setLoading(false);
  }

  return (
    <section className="px-6 py-24 fade-up">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
            Live Activity
          </p>

          <h2 className="mt-4 text-5xl font-black uppercase">
            Server Activity
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            See who is online and what is happening live on Ashfall Reborn.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
                  Online Now
                </p>

                <h3 className="mt-3 text-4xl font-black uppercase">
                  {onlinePlayers.length} Players
                </h3>
              </div>

              <div className="rounded-full bg-green-500/10 px-4 py-2 text-sm font-bold uppercase text-green-400">
                Live
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              {loading ? (
                <p className="text-zinc-500">Loading online players...</p>
              ) : onlinePlayers.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-500">
                  No players online right now.
                </div>
              ) : (
                onlinePlayers.map((player) => (
                  <div
                    key={player.steam_id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div>
                      <p className="font-black uppercase text-white">
                        {player.display_name}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Steam ID: {player.steam_id}
                      </p>
                    </div>

                    <span className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
                Latest Kills
              </p>

              <h3 className="mt-3 text-4xl font-black uppercase">
                Killfeed
              </h3>
            </div>

            <div className="mt-8 grid gap-3">
              {loading ? (
                <p className="text-zinc-500">Loading killfeed...</p>
              ) : killfeed.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-500">
                  No recent kills yet.
                </div>
              ) : (
                killfeed.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    {item.death_type === "suicide" ? (
                      <p className="font-bold text-zinc-300">
                        <span className="text-orange-500">
                          {item.victim_name}
                        </span>{" "}
                        died by suicide
                      </p>
                    ) : (
                      <p className="font-bold text-zinc-300">
                        <span className="text-orange-500">
                          {item.killer_name}
                        </span>{" "}
                        killed{" "}
                        <span className="text-red-400">
                          {item.victim_name}
                        </span>
                      </p>
                    )}

                    <p className="mt-2 text-xs text-zinc-600">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}