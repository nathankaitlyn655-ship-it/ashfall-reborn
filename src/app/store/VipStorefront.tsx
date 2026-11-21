"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";

const gamePerks = [
  ["Queue Skip", "Skip the ordinary join queue when supported by the server."],
  ["Skinbox", "Customize your item appearance without paying for stronger gear."],
  ["Box Sorting", "Organize storage containers more easily."],
  ["Team Sharing", "Easier collaboration with your existing team."],
  ["Team Auto-Authorization", "Optional team code-lock, turret, and tool-cupboard authorization plus /deauth for cleanup."],
  ["Colored Chat Name", "A cosmetic VIP name color in server chat."],
];

const discordPerks = [
  ["VIP Discord Role", "A special ASHFALL VIP role and community channel."],
  ["Member Discord Tools", "Five included /placecheck and /scan lookups during each paid month once the Discord bot is enabled."],
];

export default function VipStorefront() {
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    fetch("/api/vip/checkout", { cache: "no-store" })
      .then((res) => res.json())
      .then((result) => setAvailable(result.available === true))
      .catch(() => setAvailable(false));
  }, []);

  async function subscribe() {
    setBusy(true);
    setMessage("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = "/login";
        return;
      }
      const res = await fetch("/api/vip/checkout", {
        method: "POST",
        headers: { authorization: `Bearer ${data.session.access_token}`, "content-type": "application/json" },
        body: JSON.stringify({ acceptedTerms }),
      });
      const result = await res.json();
      if (!res.ok || !result.url) throw new Error(result.error || "VIP checkout is unavailable.");
      window.location.href = result.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start checkout.");
      setBusy(false);
    }
  }

  async function manageSubscription() {
    setBusy(true);
    setMessage("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { window.location.href = "/login"; return; }
      const response = await fetch("/api/vip/portal", {
        method: "POST", headers: { authorization: `Bearer ${data.session.access_token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Portal unavailable");
      window.location.href = result.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to open subscription management.");
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-zinc-950 px-6 pb-24 pt-36 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">ASHFALL REBORN</p>
            <h1 className="mt-3 text-5xl font-black uppercase md:text-6xl">VIP Membership</h1>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-400">Lightweight convenience and cosmetic features for our US 2X Monthly, 8-Man Vanilla+ Rust server. No paid weapons, materials, or combat boosts.</p>
          </div>

          <div className="grid overflow-hidden rounded-3xl border border-orange-500/30 bg-zinc-900 lg:grid-cols-[1fr_1.3fr]">
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-orange-900 via-zinc-900 to-zinc-950 p-10 text-center">
              <img src="/ashfall-logo.png" alt="ASHFALL REBORN logo" className="h-40 w-40 rounded-3xl object-contain" />
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.4em] text-orange-400">Monthly Membership</p>
              <h2 className="mt-2 text-4xl font-black uppercase">ASHFALL VIP</h2>
              <p className="mt-5"><span className="text-6xl font-black text-orange-500">$7.99</span><span className="ml-2 text-zinc-400">/ month</span></p>
              <p className="mt-3 max-w-sm text-sm text-zinc-400">Recurring monthly billing. Cancel through the subscription management portal after launch.</p>
            </div>

            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-black uppercase">Planned In-Game Perks</h3>
              <ul className="mt-5 space-y-4">
                {gamePerks.map(([label, detail]) => (
                  <li key={label} className="border-b border-zinc-800 pb-3">
                    <p className="font-bold text-orange-400">{label}</p>
                    <p className="mt-1 text-sm text-zinc-400">{detail}</p>
                  </li>
                ))}
              </ul>
              <h3 className="mt-8 text-2xl font-black uppercase">Planned Discord Perks</h3>
              <ul className="mt-4 space-y-4">
                {discordPerks.map(([label, detail]) => (
                  <li key={label}>
                    <p className="font-bold text-orange-400">{label}</p>
                    <p className="mt-1 text-sm text-zinc-400">{detail}</p>
                  </li>
                ))}
              </ul>

              {message && <p role="alert" className="mt-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-300">{message}</p>}
              <label className="mt-8 flex items-start gap-3 text-sm text-zinc-300">
                <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 accent-orange-500" />
                <span>I understand this is a $7.99 USD monthly recurring subscription until canceled, and agree to the <a className="text-orange-400 underline" target="_blank" rel="noopener noreferrer" href="/store/vip-terms">ASHFALL VIP Terms</a>.</span>
              </label>
              <button type="button" disabled={!available || !acceptedTerms || busy} onClick={subscribe} className="mt-5 w-full rounded-xl bg-orange-600 px-6 py-4 text-lg font-black uppercase hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400">
                {busy ? "Opening secure checkout..." : available ? "Subscribe for $7.99 / month" : "VIP Launching Soon"}
              </button>
              <button type="button" disabled={busy} onClick={manageSubscription} className="mt-3 w-full rounded-xl border border-zinc-700 px-6 py-3 text-sm font-bold text-zinc-300 hover:border-orange-500 disabled:opacity-50">Manage an Existing Subscription</button>
              <p className="mt-4 text-xs leading-6 text-zinc-500">The preview is public, but purchases remain locked until every advertised perk and recurring-payment service is configured. You must link your Steam account to activate server perks. Subscription benefits are not available before launch.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
