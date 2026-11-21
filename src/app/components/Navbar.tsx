"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/app/lib/supabaseClient";
import { SHOP_ENABLED } from "@/lib/siteFeatures";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoggedIn(false);
      return;
    }

    setLoggedIn(true);

    const { data } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setIsAdmin(true);
    }
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-zinc-800 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <img src="/favicon.png" alt="ASHFALL REBORN logo" className="h-12 w-12 rounded-full object-contain" />
          <div>
            <h1 className="text-xl font-black uppercase tracking-wide text-orange-500 transition group-hover:text-orange-400 lg:text-2xl">
              Ashfall Reborn
            </h1>

            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              US 2X Monthly • 8 Man • Vanilla+
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-wide text-zinc-300 transition hover:text-orange-500"
          >
            Home
          </Link>

          <Link
            href="/players"
            className="text-sm font-bold uppercase tracking-wide text-zinc-300 transition hover:text-orange-500"
          >
            Players
          </Link>

          <Link
            href="/leaderboards"
            className="text-sm font-bold uppercase tracking-wide text-zinc-300 transition hover:text-orange-500"
          >
            Leaderboards
          </Link>

          {SHOP_ENABLED && (
            <Link
              href="/store"
              className="text-sm font-bold uppercase tracking-wide text-zinc-300 transition hover:text-orange-500"
            >
              Store
            </Link>
          )}

          <Link
            href="/support"
            className="text-sm font-bold uppercase tracking-wide text-zinc-300 transition hover:text-orange-500"
          >
            Support
          </Link>

          {loggedIn && (
            <Link
              href="/dashboard"
              className="text-sm font-bold uppercase tracking-wide text-zinc-300 transition hover:text-orange-500"
            >
              Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm font-black uppercase tracking-wide text-orange-500 transition hover:bg-orange-500 hover:text-black"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!loggedIn ? (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg border border-zinc-700 px-5 py-2 text-sm font-bold uppercase tracking-wide transition hover:border-orange-500 hover:text-orange-500 md:block"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-black uppercase tracking-wide transition hover:bg-orange-700"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="hidden rounded-lg border border-zinc-700 px-5 py-2 text-sm font-bold uppercase tracking-wide transition hover:border-orange-500 hover:text-orange-500 md:block"
              >
                Profile
              </Link>

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-bold uppercase tracking-wide transition hover:border-red-500 hover:text-red-400"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
