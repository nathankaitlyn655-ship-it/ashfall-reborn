"use client";

import { useEffect, useState } from "react";

type ServerData = {
  name: string;
  status: string;
  players: number;
  maxPlayers: number;
  rank: number | null;
  ip: string;
  port: number;
};

export default function ServerStatus() {
  const [server, setServer] = useState<ServerData | null>(null);

  useEffect(() => {
    async function fetchServer() {
      try {
        const res = await fetch("/api/server-status");
        const data = await res.json();

        setServer(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchServer();

    const interval = setInterval(fetchServer, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!server) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        Loading server stats...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
            Live Server Status
          </p>

          <h2 className="mt-3 text-4xl font-black uppercase">
            {server.name}
          </h2>

          <p className="mt-4 text-zinc-400">
            {server.ip}:{server.port}
          </p>
        </div>

        <div
          className={`rounded-2xl px-6 py-4 text-center ${
            server.status === "online"
              ? "bg-green-500/10"
              : "bg-red-500/10"
          }`}
        >
          <p
            className={`text-lg font-black uppercase ${
              server.status === "online"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {server.status}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
            Players
          </p>

          <p className="mt-3 text-3xl font-black">
            {server.players}/{server.maxPlayers}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
            Rank
          </p>

          <p className="mt-3 text-3xl font-black">
            #{server.rank ?? "N/A"}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
            Connect
          </p>

          <a
            href={`steam://connect/${server.ip}:${server.port}`}
            className="mt-3 inline-block text-2xl font-black text-orange-500 hover:text-orange-400"
          >
            Join
          </a>
        </div>
      </div>
    </div>
  );
}