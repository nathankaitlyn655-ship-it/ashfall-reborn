"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function login() {
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const user = data.user;

    const { data: adminData } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .single();

    window.location.href = adminData ? "/admin" : "/dashboard";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0">
        <img
          src="https://i.imgur.com/OCzWrRI.png"
          alt="Ashfall Reborn Login Background"
          className="h-full w-full scale-105 object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      <div className="pointer-events-none absolute left-10 top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-32 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-orange-500">
            Ashfall Reborn
          </p>

          <h1 className="mt-5 text-6xl font-black uppercase leading-none md:text-7xl">
            Enter The Wipe
          </h1>

          <p className="mt-6 max-w-xl text-lg text-zinc-300">
            Login to access your player dashboard, support tickets, profile,
            leaderboards, and future Ashfall Reborn account features.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["2X", "Modded"],
              ["US", "Main"],
              ["Monthly", "Wipes"],
            ].map(([top, bottom]) => (
              <div
                key={top}
                className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5 text-center backdrop-blur"
              >
                <p className="text-3xl font-black text-orange-500">{top}</p>
                <p className="mt-1 text-sm font-bold uppercase tracking-widest text-zinc-400">
                  {bottom}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-orange-500/20 bg-zinc-900/90 p-8 shadow-2xl shadow-orange-500/10 backdrop-blur">
          <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              Member Access
            </p>

            <h2 className="mt-3 text-4xl font-black uppercase">
              Login
            </h2>

            <p className="mt-3 text-zinc-400">
              Continue to your Ashfall Reborn account.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-400">
              {errorMessage}
            </div>
          )}

          <div className="space-y-5">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 outline-none transition focus:border-orange-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 outline-none transition focus:border-orange-500"
            />

            <button
              onClick={login}
              className="w-full rounded-xl bg-orange-600 px-6 py-4 text-lg font-black uppercase tracking-wide transition hover:scale-[1.02] hover:bg-orange-700"
            >
              Login
            </button>

            <div className="flex items-center justify-between gap-4 text-sm font-bold uppercase tracking-widest">
              <a href="/" className="text-zinc-500 hover:text-orange-500">
                Back Home
              </a>

              <a href="/signup" className="text-orange-500 hover:text-orange-400">
                Create Account
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}