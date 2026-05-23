"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function signUp() {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Account created successfully. Sending you to profile setup...");

    setTimeout(() => {
      window.location.href = "/profile";
    }, 1200);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0">
        <img
          src="https://i.imgur.com/OCzWrRI.png"
          alt="Ashfall Reborn Signup Background"
          className="h-full w-full scale-105 object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      <div className="pointer-events-none absolute right-10 top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-32 lg:grid-cols-2">
        <div className="order-2 rounded-3xl border border-orange-500/20 bg-zinc-900/90 p-8 shadow-2xl shadow-orange-500/10 backdrop-blur lg:order-1">
          <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              New Survivor
            </p>

            <h2 className="mt-3 text-4xl font-black uppercase">
              Create Account
            </h2>

            <p className="mt-3 text-zinc-400">
              Build your Ashfall Reborn profile and join the community.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-400">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm font-bold text-green-400">
              {successMessage}
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
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 outline-none transition focus:border-orange-500"
            />

            <button
              onClick={signUp}
              className="w-full rounded-xl bg-orange-600 px-6 py-4 text-lg font-black uppercase tracking-wide transition hover:scale-[1.02] hover:bg-orange-700"
            >
              Create Account
            </button>

            <div className="flex items-center justify-between gap-4 text-sm font-bold uppercase tracking-widest">
              <a href="/" className="text-zinc-500 hover:text-orange-500">
                Back Home
              </a>

              <a href="/login" className="text-orange-500 hover:text-orange-400">
                Login Instead
              </a>
            </div>
          </div>
        </div>

        <div className="order-1 text-left lg:order-2">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-orange-500">
            Join Ashfall Reborn
          </p>

          <h1 className="mt-5 text-6xl font-black uppercase leading-none md:text-7xl">
            Start Your Story
          </h1>

          <p className="mt-6 max-w-xl text-lg text-zinc-300">
            Create an account to manage your profile, submit support tickets,
            track future stats, and connect with the Ashfall Reborn community.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Profile", "Save your identity"],
              ["Support", "Open tickets"],
              ["Stats", "Coming soon"],
            ].map(([top, bottom]) => (
              <div
                key={top}
                className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5 text-center backdrop-blur"
              >
                <p className="text-2xl font-black text-orange-500">{top}</p>
                <p className="mt-1 text-sm font-bold uppercase tracking-widest text-zinc-400">
                  {bottom}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}