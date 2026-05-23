"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ServerStatus from "./components/ServerStatus";
import AuthCTA from "./components/AuthCTA";

function getNextFirstFriday() {
  const now = new Date();

  let year = now.getFullYear();
  let month = now.getMonth();

  for (let i = 0; i < 12; i++) {
    const firstDay = new Date(year, month, 1);
    const day = firstDay.getDay();
    const firstFridayDate = 1 + ((5 - day + 7) % 7);
    const firstFriday = new Date(year, month, firstFridayDate, 15, 0, 0);

    if (firstFriday > now) {
      return firstFriday;
    }

    month++;

    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return new Date();
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const nextWipe = getNextFirstFriday();
      const now = new Date();
      const difference = nextWipe.getTime() - now.getTime();

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
              src="https://i.imgur.com/OCzWrRI.png"
              alt="Ashfall Reborn Background"
              className="h-full w-full scale-105 object-cover"
            />

            <div className="absolute inset-0 bg-black/70" />
          </div>

          <div className="relative z-10 px-6 text-center fade-up">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              US Main • 2X Modded • Monthly
            </p>

            <h1 className="text-5xl font-black uppercase tracking-wide md:text-7xl">
              Ashfall Reborn
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300">
              Competitive Rust PvP with custom monuments, large custom maps,
              balanced progression, PvP events, active admins, and monthly
              wipes every first Friday.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="steam://connect/198.73.57.143:28025"
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

              <a
                href="/store"
                className="rounded-lg border border-zinc-600 bg-black/30 px-6 py-3 font-bold backdrop-blur transition duration-300 hover:scale-105 hover:bg-zinc-900"
              >
                View Store
              </a>
            </div>
          </div>
        </section>

        {/* ACCOUNT CTA */}
        <AuthCTA />

        {/* COUNTDOWN */}
        <section id="countdown" className="px-6 py-24 fade-up">
          <div className="mx-auto max-w-5xl rounded-3xl border border-orange-500/30 bg-orange-500/10 p-10 text-center shadow-2xl shadow-orange-500/10">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              Next Wipe Countdown
            </p>

            <h2 className="mt-3 text-4xl font-black uppercase">
              Every First Friday
            </h2>

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
                  <p className="text-4xl font-black text-orange-500">
                    {value}
                  </p>

                  <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
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
                  "2X Modded",
                  "Balanced gather rates, faster smelting, optimized loot, and quality-of-life improvements.",
                ],
                [
                  "Custom Map",
                  "Large custom PvP map with custom monuments and recycler locations.",
                ],
                [
                  "Monthly Wipes",
                  "Fresh wipe every first Friday of the month.",
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

        {/* STORE PREVIEW */}
        <section className="px-6 pb-24 fade-up">
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

              <a href="/store" className="transition hover:text-orange-500">
                Store
              </a>

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