"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [steamId, setSteamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const { data } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setDisplayName(data.display_name || data.username || "");
        setSteamId(data.steam_id_public || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function saveProfile() {
    if (!displayName.trim()) {
      alert("Please enter a display name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("player_profiles")
      .upsert(
        {
          user_id: userId,
          username: displayName,
          display_name: displayName,
          steam_id_public: steamId,
        },
        {
          onConflict: "user_id",
        }
      );

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile saved!");
    window.location.href = "/dashboard";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading profile...
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900 p-10 fade-up">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
            Player Profile
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase">
            Your Profile
          </h1>

          <p className="mt-6 text-zinc-400">Logged in as:</p>

          <p className="mt-2 font-bold text-orange-500">{email}</p>

          <div className="mt-8 space-y-4">
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
            />

            <input
              type="text"
              placeholder="Steam ID / Profile Link"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
            />

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full rounded-xl bg-orange-600 px-6 py-3 font-bold transition hover:bg-orange-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}