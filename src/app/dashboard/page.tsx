"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import ServerStatus from "../components/ServerStatus";

type Profile = {
  display_name: string;
  username: string;
  steam_id_public: string;
  avatar_url: string;
  kills: number;
  deaths: number;
  raids: number;
  playtime_minutes: number;
  account_status: string;
  role: string;
};

type Ticket = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
};

type Announcement = {
  id: string;
  title: string;
  category: string;
  created_at: string;
};

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setEmail(user.email || "");

    const { data: profileData } = await supabase
      .from("player_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: ticketData } = await supabase
      .from("support_tickets")
      .select("id, subject, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    const { data: announcementData } = await supabase
      .from("announcements")
      .select("id, title, category, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);

    setProfile(profileData);
    setTickets(ticketData || []);
    setAnnouncements(announcementData || []);
    setLoading(false);
  }

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

  const displayName =
    profile?.display_name || profile?.username || "Ashfall Player";

  const kills = profile?.kills || 0;
  const deaths = profile?.deaths || 0;
  const raids = profile?.raids || 0;
  const playtime = profile?.playtime_minutes || 0;
  const kd = deaths === 0 ? kills : (kills / deaths).toFixed(2);

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-6 py-32 text-white">
        <div className="absolute inset-0">
          <img
            src="https://i.imgur.com/OCzWrRI.png"
            alt="Ashfall Reborn Dashboard Background"
            className="h-full w-full scale-105 object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-black/85" />
        </div>

        <div className="pointer-events-none absolute left-10 top-32 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 right-10 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

        <section className="relative z-10 mx-auto max-w-7xl fade-up">
          <div className="overflow-hidden rounded-[2rem] border border-orange-500/20 bg-zinc-900/90 shadow-2xl shadow-orange-500/10 backdrop-blur">
            <div className="relative p-10">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />

              <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-orange-500/40 bg-orange-500/10 text-6xl font-black text-orange-500">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Player Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.4em] text-orange-500">
                      Player Dashboard
                    </p>

                    <h1 className="mt-3 text-5xl font-black uppercase md:text-6xl">
                      {displayName}
                    </h1>

                    <p className="mt-3 break-all text-zinc-400">
                      {email}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-bold uppercase text-green-400">
                        {profile?.account_status || "Active"}
                      </span>

                      <span className="rounded-lg bg-orange-500/10 px-4 py-2 text-sm font-bold uppercase text-orange-500">
                        {profile?.role || "Player"}
                      </span>

                      <span className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-bold uppercase text-zinc-400">
                        {profile?.steam_id_public ? "Steam Linked" : "Steam Not Linked"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="/profile"
                    className="rounded-xl border border-zinc-700 px-6 py-4 text-center font-black uppercase transition hover:border-orange-500 hover:text-orange-500"
                  >
                    Edit Profile
                  </a>

                  <a
                    href="/support"
                    className="rounded-xl border border-zinc-700 px-6 py-4 text-center font-black uppercase transition hover:border-orange-500 hover:text-orange-500"
                  >
                    Support
                  </a>

                  <button
                    onClick={logout}
                    className="rounded-xl bg-orange-600 px-6 py-4 font-black uppercase transition hover:bg-orange-700"
                  >
                    Logout
                  </button>
                </div>
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
                className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 text-center backdrop-blur transition hover:-translate-y-2 hover:border-orange-500"
              >
                <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                  {label}
                </p>

                <p className="mt-3 text-5xl font-black">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 backdrop-blur lg:col-span-2">
              <h2 className="text-3xl font-black uppercase text-orange-500">
                Server Access
              </h2>

              <p className="mt-3 text-zinc-400">
                Connect to the server, view live status, and stay ready for the
                next wipe.
              </p>

              <div className="mt-6">
                <ServerStatus />
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 backdrop-blur">
              <h2 className="text-3xl font-black uppercase text-orange-500">
                Quick Actions
              </h2>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href="steam://connect/198.73.57.143:28025"
                  className="rounded-xl bg-orange-600 px-5 py-4 text-center font-black uppercase transition hover:bg-orange-700"
                >
                  Connect To Server
                </a>

                <a
                  href="/leaderboards"
                  className="rounded-xl bg-zinc-950 px-5 py-4 font-bold uppercase transition hover:bg-zinc-800"
                >
                  View Leaderboards
                </a>

                <a
                  href="/store"
                  className="rounded-xl bg-zinc-950 px-5 py-4 font-bold uppercase transition hover:bg-zinc-800"
                >
                  Visit Store
                </a>

                <a
                  href="/map"
                  className="rounded-xl bg-zinc-950 px-5 py-4 font-bold uppercase transition hover:bg-zinc-800"
                >
                  View Map
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-black uppercase text-orange-500">
                  Recent Tickets
                </h2>

                <a
                  href="/support"
                  className="text-sm font-bold uppercase text-orange-500 hover:text-orange-400"
                >
                  View All
                </a>
              </div>

              <div className="mt-6 grid gap-4">
                {tickets.length === 0 ? (
                  <div className="rounded-2xl bg-zinc-950 p-6 text-zinc-500">
                    No recent support tickets.
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                    >
                      <p
                        className={`text-sm font-bold uppercase ${
                          ticket.status === "open"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {ticket.status}
                      </p>

                      <h3 className="mt-2 text-xl font-black uppercase">
                        {ticket.subject}
                      </h3>

                      <p className="mt-2 text-xs text-zinc-600">
                        {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-black uppercase text-orange-500">
                  Latest News
                </h2>

                <a
                  href="/"
                  className="text-sm font-bold uppercase text-orange-500 hover:text-orange-400"
                >
                  Home
                </a>
              </div>

              <div className="mt-6 grid gap-4">
                {announcements.length === 0 ? (
                  <div className="rounded-2xl bg-zinc-950 p-6 text-zinc-500">
                    No announcements yet.
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                    >
                      <p className="text-sm font-bold uppercase text-orange-500">
                        {announcement.category}
                      </p>

                      <h3 className="mt-2 text-xl font-black uppercase">
                        {announcement.title}
                      </h3>

                      <p className="mt-2 text-xs text-zinc-600">
                        {new Date(
                          announcement.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-8 text-center backdrop-blur">
            <h2 className="text-3xl font-black uppercase">
              More Account Features Coming Soon
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-zinc-400">
              Future dashboard updates may include live player stats, killfeed
              tracking, raid history, support notifications, store syncing,
              Discord linking, and player achievements.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}