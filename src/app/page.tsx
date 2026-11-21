"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ServerStatus from "./components/ServerStatus";
import AuthCTA from "./components/AuthCTA";
import Announcements from "./components/Announcements";
import LiveActivity from "./components/LiveActivity";
import { SHOP_ENABLED, LEGACY_KITS_ENABLED } from "@/lib/siteFeatures";

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
        {/* The supplied graphic contains the server name; it sits beside the
            content instead of behind duplicate, overlapping headline text. */}
        <section id="home" className="relative isolate overflow-hidden border-b border-white/10 bg-[#0b0e12] px-5 pb-24 pt-36 sm:px-8 lg:pb-32 lg:pt-44">
          <div aria-hidden="true" className="pointer-events-none absolute -left-44 top-16 h-[34rem] w-[34rem] rounded-full bg-orange-600/10 blur-[110px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-red-800/10 blur-[110px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
            <div className="fade-up">
              <p className="mb-6 inline-flex items-center gap-3 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.13em] text-orange-300">
                <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" /> US Monthly · Vanilla+
              </p>
              <h1 className="max-w-2xl text-5xl font-black uppercase leading-[0.96] tracking-tight text-white sm:text-6xl lg:text-[5.35rem]">
                Your next <span className="block text-orange-500">Rust wipe</span> starts here.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-300">
                Ashfall Reborn is a competitive, vanilla-style 2x monthly server. Build your eight-person team, earn every win, and keep the grind focused on survival.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="steam://connect/45.144.225.22:28015" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-600 px-7 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-950/40 transition hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">Connect to server</a>
                <a href="https://discord.gg/M8DQXyqZpm" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-7 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-orange-500/60 hover:bg-white/10">Join Discord</a>
              </div>
              <p className="mt-5 text-sm text-zinc-400">Direct connect: <span className="font-mono font-semibold text-zinc-200">45.144.225.22:28015</span></p>
              <div className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.035] py-5">
                <div className="px-3 text-center"><p className="text-3xl font-black text-white">2x</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-400">Gather &amp; smelt</p></div>
                <div className="px-3 text-center"><p className="text-3xl font-black text-white">8</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-400">Team max</p></div>
                <div className="px-3 text-center"><p className="text-3xl font-black text-white">50%</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-400">Less upkeep</p></div>
              </div>
            </div>
            <figure className="relative overflow-hidden rounded-[1.75rem] border border-orange-500/20 bg-[#10161a] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-4">
              <img src="https://i.imgur.com/gc7jBvm.png" alt="ASHFALL REBORN official server banner" className="h-auto w-full rounded-2xl object-contain" />
              <figcaption className="flex flex-wrap items-center justify-between gap-3 px-3 pb-2 pt-5 text-xs font-bold uppercase tracking-[0.13em] text-zinc-400">
                <span className="text-orange-400">ASHFALL / REBORN</span>
                <span>2x · Monthly · 8 Man</span>
              </figcaption>
            </figure>
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

        {/* Old pay-to-win kit catalog is archived and not publicly offered. */}
        {LEGACY_KITS_ENABLED && <section className="px-6 pb-24 fade-up">
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

        {SHOP_ENABLED && (
          <section className="px-6 pb-24 fade-up">
            <div className="mx-auto max-w-7xl rounded-3xl border border-orange-500/30 bg-zinc-900 p-10 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">Coming Soon</p>
              <h2 className="mt-4 text-4xl font-black uppercase">ASHFALL VIP • $7.99 / Month</h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">A cosmetic and convenience-focused membership is in preparation. No weapons, materials or combat boosts.</p>
              <a href="/store" className="mt-6 inline-block rounded-lg bg-orange-600 px-6 py-3 font-black hover:bg-orange-700">Preview VIP Perks</a>
            </div>
          </section>
        )}

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

      </main>
    </>
  );
}
