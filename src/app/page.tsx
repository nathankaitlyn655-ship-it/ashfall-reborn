"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ServerStatus from "./components/ServerStatus";
import AuthCTA from "./components/AuthCTA";
import Announcements from "./components/Announcements";
import LiveActivity from "./components/LiveActivity";
import { SHOP_ENABLED } from "@/lib/siteFeatures";

// Set this env variable only after the official force-wipe time is confirmed.
const NEXT_WIPE_UTC = process.env.NEXT_PUBLIC_NEXT_WIPE_UTC;
const NEXT_WIPE_TIME = NEXT_WIPE_UTC ? Date.parse(NEXT_WIPE_UTC) : NaN;
const HAS_CONFIRMED_WIPE = Number.isFinite(NEXT_WIPE_TIME);

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    if (!HAS_CONFIRMED_WIPE) return;

    const updateTimer = () => {
      const difference = Math.max(0, NEXT_WIPE_TIME - Date.now());
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };
    updateTimer();
    const timer = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Navbar />

      <main className="bg-zinc-950 text-white">
        {/* HERO */}
        <section
          id="home"
          className="relative flex min-h-screen items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0">
            <img
              src="https://i.imgur.com/gc7jBvm.png"
              alt="Ashfall Reborn Background"
              className="h-full w-full scale-105 object-cover"
            />

            <div className="absolute inset-0 bg-black/70" />
          </div>

          <div className="relative z-10 px-6 text-center fade-up">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              US 2X Monthly • Max 8 • Vanilla+
            </p>

            <h1 className="text-5xl font-black uppercase tracking-wide md:text-7xl">
              Ashfall Reborn
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300">
              A vanilla-like Rust experience with 2X gathering, smelting and
              recycling, 50% lower TC upkeep, 8-player maximum teams, and
              lightweight quality-of-life features. No pay-to-win kits.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="steam://connect/45.144.225.22:28015"
                className="rounded-lg bg-orange-600 px-6 py-3 font-bold transition duration-300 hover:scale-105 hover:bg-orange-700"
              >
                Connect To Server
              </a>

              <a
                href="https://discord.gg/M8DQXyqZpm"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-600 bg-black/30 px-6 py-3 font-bold backdrop-blur transition duration-300 hover:scale-105 hover:bg-zinc-900"
              >
                Join Discord
              </a>

              {SHOP_ENABLED && (
                <a
                  href="/store"
                  className="rounded-lg border border-zinc-600 bg-black/30 px-6 py-3 font-bold backdrop-blur transition duration-300 hover:scale-105 hover:bg-zinc-900"
                >
                  View Store
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ACCOUNT CTA */}
        <AuthCTA />

        {/* ANNOUNCEMENTS */}
        <Announcements />

        {/* LIVE ACTIVITY */}
        <LiveActivity />

        {/* COUNTDOWN */}
        <section id="countdown" className="px-6 py-24 fade-up">
          <div className="mx-auto max-w-5xl rounded-3xl border border-orange-500/30 bg-orange-500/10 p-10 text-center shadow-2xl shadow-orange-500/10">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              Next Wipe Countdown
            </p>

            <h2 className="mt-3 text-4xl font-black uppercase">
              Monthly Force Wipes
            </h2>

            {HAS_CONFIRMED_WIPE ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-4">
                {[
                  ["Days", timeLeft.days],
                  ["Hours", timeLeft.hours],
                  ["Minutes", timeLeft.minutes],
                  ["Seconds", timeLeft.seconds],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition duration-300 hover:-translate-y-2 hover:border-orange-500"
                  >
                    <p className="text-4xl font-black text-orange-500">{value}</p>
                    <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">{label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mx-auto mt-6 max-w-2xl text-zinc-300">
                The next wipe time will be confirmed in Discord. Type <strong>/wipe</strong> in game for server wipe information.
              </p>
            )}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="px-6 py-24 fade-up">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-4xl font-black uppercase">
              Server Features
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                [
                  "2X Vanilla+",
                  "2X gather, smelt and recycling with 50% less TC upkeep and lightweight quality-of-life features.",
                ],
                [
                  "8-Man Teams",
                  "Maximum 8 players per team. PvP-focused monthly survival without pay-to-win advantages.",
                ],
                [
                  "Lightweight Quality of Life",
                  "Player teleport and remote trade have cooldowns and combat/raid blocks. Clans and other light QoL tools are available.",
                ],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 transition duration-300 hover:-translate-y-2 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10"
                >
                  <h3 className="text-2xl font-black text-orange-500">
                    {title}
                  </h3>

                  <p className="mt-4 leading-7 text-zinc-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Store content stays in the source but is hidden until SHOP_ENABLED. */}
        {SHOP_ENABLED && <section className="px-6 pb-24 fade-up">
          <div className="mx-auto max-w-7xl rounded-3xl border border-orange-500/20 bg-zinc-900 p-10">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
                Official Store
              </p>

              <h2 className="mt-4 text-5xl font-black uppercase">
                Support Ashfall Reborn
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
                Support the server through cosmetic packages, VIP perks,
                supporter ranks, and more while keeping gameplay balanced.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                [
                  "VIP Package",
                  "Exclusive supporter role, perks, and community rewards.",
                ],
                [
                  "Starter Kits",
                  "Balanced starter kits designed for fair gameplay.",
                ],
                [
                  "Cosmetics",
                  "Unique cosmetic rewards and supporter customization.",
                ],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 transition duration-300 hover:-translate-y-2 hover:border-orange-500"
                >
                  <h3 className="text-2xl font-black text-orange-500">
                    {title}
                  </h3>

                  <p className="mt-4 text-zinc-400">{text}</p>

                  <a
                    href="/store"
                    className="mt-6 inline-block rounded-lg bg-orange-600 px-5 py-3 font-bold transition hover:bg-orange-700"
                  >
                    View Store
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {/* END-OF-WIPE LEADERBOARD REWARDS */}
        <section id="rewards" className="px-6 pb-24 fade-up">
          <div className="mx-auto max-w-7xl rounded-3xl border border-orange-500/30 bg-zinc-900 p-8 text-center md:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">Monthly Competition</p>
            <h2 className="mt-4 text-4xl font-black uppercase">Leaderboard Cash Rewards</h2>
            <p className="mx-auto mt-4 max-w-3xl text-zinc-400">Compete throughout the wipe. The top eligible winner in each category earns a payout at wipe end.</p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                ["$15", "#1 PvP Kills", "One player with the most qualifying PvP kills."],
                ["$10", "#1 Sulfur Mined", "One player with the most qualifying sulfur mined."],
                ["$20", "#1 Clan", "One reward for the entire top clan by PvP kills — $20 total, not per member."],
              ].map(([amount, category, detail]) => (
                <div key={category} className="rounded-2xl border border-zinc-700 bg-zinc-950 p-7">
                  <p className="text-5xl font-black text-orange-500">{amount}</p>
                  <h3 className="mt-3 text-xl font-black uppercase">{category}</h3>
                  <p className="mt-3 text-sm text-zinc-400">{detail}</p>
                </div>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-3xl text-xs leading-6 text-zinc-500">Rewards are reviewed and confirmed by staff after each wipe. Exploits, stat farming, and rule violations can disqualify entries. The clan reward is a single $20 payout for the winning clan as a whole. See Discord for award details and eligibility.</p>
            <a href="/leaderboards" className="mt-6 inline-block rounded-lg bg-orange-600 px-6 py-3 font-bold transition hover:bg-orange-700">View Leaderboards</a>
          </div>
        </section>

        {/* LIVE SERVER STATUS */}
        <section className="px-6 pb-24 fade-up">
          <div className="mx-auto max-w-7xl">
            <ServerStatus />
          </div>
        </section>

        {/* DISCORD WIDGET */}
        <section className="px-6 pb-24 fade-up">
          <div className="mx-auto max-w-7xl rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
                  Join The Community
                </p>

                <h2 className="mt-3 text-4xl font-black uppercase">
                  Ashfall Reborn Discord
                </h2>

                <p className="mt-4 text-zinc-400">
                  Join our Discord for wipe announcements, server updates,
                  support, events, clips, suggestions, and community chat.
                </p>

                <a
                  href="https://discord.gg/M8DQXyqZpm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-lg bg-orange-600 px-6 py-3 font-bold transition hover:bg-orange-700"
                >
                  Join Discord
                </a>
              </div>

              <iframe
                src="https://discord.com/widget?id=1469619086487982122&theme=dark"
                width="100%"
                height="420"
                frameBorder="0"
                allow="clipboard-write"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                className="rounded-2xl border border-zinc-800"
              />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-zinc-800 px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <h3 className="text-xl font-black uppercase text-orange-500">
                Ashfall Reborn
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Competitive Rust PvP Experience
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a
                href="https://discord.gg/M8DQXyqZpm"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-orange-500"
              >
                Discord
              </a>

              {SHOP_ENABLED && <a href="/store" className="transition hover:text-orange-500">Store</a>}

              <a href="/login" className="transition hover:text-orange-500">
                Login
              </a>

              <a href="/signup" className="transition hover:text-orange-500">
                Signup
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
