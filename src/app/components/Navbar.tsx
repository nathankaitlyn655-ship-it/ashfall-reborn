"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    ["Home", "/"],
    ["Store", "/store"],
    ["Rules", "/rules"],
    ["Staff", "/staff"],
    ["Wipes", "/wipes"],
    ["Map", "/map"],
    ["Leaderboards", "/leaderboards"],
    ["Support", "/support"],
    ["Dashboard", "/dashboard"],
    ["Admin", "/admin"],
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <a href="/">
            <h1 className="text-2xl font-black uppercase tracking-widest text-orange-500">
              Ashfall Reborn
            </h1>
          </a>

          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Rust PvP Server
          </p>
        </div>

        <nav className="hidden items-center gap-5 xl:flex">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-bold uppercase text-zinc-300 transition hover:text-orange-500"
            >
              {label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-bold uppercase text-white xl:hidden"
        >
          Menu
        </button>

        <a
          href="https://discord.gg/M8DQXyqZpm"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-lg bg-orange-600 px-5 py-2 text-sm font-bold uppercase transition hover:bg-orange-700 xl:block"
        >
          Join Discord
        </a>
      </div>

      {menuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-4 xl:hidden">
          <nav className="flex flex-col gap-4">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-bold uppercase text-zinc-300 hover:text-orange-500"
              >
                {label}
              </a>
            ))}

            <a
              href="https://discord.gg/M8DQXyqZpm"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-orange-600 px-5 py-3 text-center font-bold uppercase transition hover:bg-orange-700"
            >
              Join Discord
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}