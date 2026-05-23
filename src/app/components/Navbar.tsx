"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-orange-500">
            Ashfall Reborn
          </h1>

          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Rust PvP Server
          </p>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#home" className="text-sm font-bold uppercase text-zinc-300 hover:text-orange-500">
            Home
          </a>
          <a href="#countdown" className="text-sm font-bold uppercase text-zinc-300 hover:text-orange-500">
            Wipe
          </a>
          <a href="#features" className="text-sm font-bold uppercase text-zinc-300 hover:text-orange-500">
            Features
          </a>
          <a href="https://ashfallreborn.tip4serv.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-bold uppercase text-zinc-300 hover:text-orange-500">
            Store
          </a>
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-bold uppercase text-white md:hidden"
        >
          Menu
        </button>

        <a
          href="https://discord.gg/M8DQXyqZpm"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-lg bg-orange-600 px-5 py-2 text-sm font-bold uppercase transition hover:bg-orange-700 md:block"
        >
          Join Now
        </a>
      </div>

      {menuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a href="#home" onClick={() => setMenuOpen(false)} className="font-bold uppercase text-zinc-300 hover:text-orange-500">
              Home
            </a>
            <a href="#countdown" onClick={() => setMenuOpen(false)} className="font-bold uppercase text-zinc-300 hover:text-orange-500">
              Wipe
            </a>
            <a href="#features" onClick={() => setMenuOpen(false)} className="font-bold uppercase text-zinc-300 hover:text-orange-500">
              Features
            </a>
            <a href="https://ashfallreborn.tip4serv.com/" target="_blank" rel="noopener noreferrer" className="font-bold uppercase text-zinc-300 hover:text-orange-500">
              Store
            </a>
            <a href="https://discord.gg/M8DQXyqZpm" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-orange-600 px-5 py-3 text-center font-bold uppercase hover:bg-orange-700">
              Join Discord
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}