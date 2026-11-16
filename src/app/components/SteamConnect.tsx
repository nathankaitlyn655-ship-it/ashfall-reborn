"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
export default function SteamConnect() {
  const [steam, setSteam] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/steam/status", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
      if (res.ok) setSteam((await res.json()).steamId);
    })();
    const status = new URLSearchParams(window.location.search).get("steam");
    if (status === "linked") setMessage("Steam account verified and linked.");
    else if (status) setMessage("Steam linking failed. Please try again.");
  }, []);
  async function connect() {
    setBusy(true); setMessage("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }
      const res = await fetch("/api/steam/link", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } });
      const result = await res.json();
      if (!res.ok || !result.url) throw new Error(result.error || "Unable to connect Steam");
      window.location.assign(result.url);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to connect Steam"); setBusy(false); }
  }
  return <div className="mt-6 rounded-2xl border border-orange-500/30 bg-zinc-950 p-5">
    <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Verified Steam Account</p>
    <p className="mt-2 break-all text-sm text-zinc-300">{steam ? `Linked SteamID: ${steam}` : "Not connected — required for future premium purchases"}</p>
    {message && <p className="mt-2 text-sm text-orange-300">{message}</p>}
    <button type="button" disabled={busy} onClick={connect} className="mt-4 rounded-lg bg-orange-600 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Connecting..." : steam ? "Reconnect Steam" : "Connect Steam"}</button>
    <p className="mt-2 text-xs text-zinc-500">Only Steam-verified IDs will be used for paid kit delivery.</p>
  </div>;
}
