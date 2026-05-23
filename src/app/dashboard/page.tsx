"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

type Profile = {
  display_name: string;
  username: string;
  steam_id_public: string;
  kills: number;
  deaths: number;
  raids: number;
  playtime_minutes: number;
};

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setEmail(user.email || "");

      const { data } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading dashboard...
      </main>
    );
  }

  const kills = profile?.kills || 0;
  const deaths = profile?.deaths || 0;
  const raids = profile?.raids || 0;
  const playtime = profile?.playtime_minutes || 0;
  const kd = deaths === 0 ? kills : (kills / deaths).toFixed(2);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-7xl fade-up">
          <div className="rounded-3xl border border-orange-500/20 bg-zinc-900 p-10 shadow-2xl shadow-orange-500/10">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              Player Dashboard
            </p>

            <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h1 className="text-5xl font-black uppercase">
                  Welcome Back
                </h1>

                <p className="mt-4 text-zinc-400">
                  Logged in as{" "}
                  <span className="font-bold text-orange-500">{email}</span>
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="/profile"
                  className="rounded-lg border border-zinc-700 px-5 py-3 text-center font-bold uppercase transition hover:border-orange-500 hover:text-orange-500"
                >
                  Edit Profile
                </a>

                <button
                  onClick={logout}
                  className="rounded-lg bg-orange-600 px-5 py-3 font-bold uppercase transition hover:bg-orange-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              ["Kills", kills],
              ["Deaths", deaths],
              ["K/D", kd],
              ["Raids", raids],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center transition hover:-translate-y-2 hover:border-orange-500"
              >
                <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                  {label}
                </p>

                <p className="mt-3 text-4xl font-black">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 lg:col-span-2">
              <h2 className="text-3xl font-black uppercase text-orange-500">
                Player Profile
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-zinc-950 p-5">
                  <p className="text-sm uppercase tracking-widest text-zinc-500">
                    Display Name
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {profile?.display_name || profile?.username || "Not set"}
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-5">
                  <p className="text-sm uppercase tracking-widest text-zinc-500">
                    Steam ID
                  </p>
                  <p className="mt-2 break-all text-xl font-bold">
                    {profile?.steam_id_public || "Not linked"}
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-5">
                  <p className="text-sm uppercase tracking-widest text-zinc-500">
                    Playtime
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {Math.floor(playtime / 60)}h {playtime % 60}m
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-5">
                  <p className="text-sm uppercase tracking-widest text-zinc-500">
                    Account Status
                  </p>
                  <p className="mt-2 text-xl font-bold text-green-400">
                    Active
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-3xl font-black uppercase text-orange-500">
                Quick Links
              </h2>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href="/leaderboards"
                  className="rounded-xl bg-zinc-950 px-5 py-4 font-bold transition hover:bg-zinc-800"
                >
                  View Leaderboards
                </a>

                <a
                  href="/support"
                  className="rounded-xl bg-zinc-950 px-5 py-4 font-bold transition hover:bg-zinc-800"
                >
                  Create Support Ticket
                </a>

                <a
                  href="/store"
                  className="rounded-xl bg-zinc-950 px-5 py-4 font-bold transition hover:bg-zinc-800"
                >
                  Visit Store
                </a>

                <a
                  href="steam://connect/198.73.57.143:28025"
                  className="rounded-xl bg-orange-600 px-5 py-4 text-center font-bold transition hover:bg-orange-700"
                >
                  Connect To Server
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}