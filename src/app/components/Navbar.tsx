"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/app/lib/supabaseClient";
import { SHOP_ENABLED } from "@/lib/siteFeatures";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = usePathname();

  useEffect(() => setMobileOpen(false), [path]);

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

    setIsAdmin(!!data);
  }

  const navItems = [
    { href: "/", title: "Home" },
    { href: "/players", title: "Players" },
    { href: "/leaderboards", title: "Leaderboards" },
    ...(SHOP_ENABLED ? [{ href: "/store", title: "VIP Store" }] : []),
    { href: "/support", title: "Support" },
    ...(loggedIn ? [{ href: "/dashboard", title: "Dashboard" }] : []),
    ...(isAdmin ? [{ href: "/admin", title: "Admin" }] : []),
  ];

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#080b0e]/95 shadow-xl shadow-black/30 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="Ashfall Reborn home">
          <img src="/ashfall-logo.png" alt="ASHFALL REBORN logo" className="h-12 w-12 shrink-0 rounded-xl object-contain ring-1 ring-orange-500/25" />
          <div>
            <p className="text-lg font-black uppercase leading-none tracking-wide text-orange-500 transition group-hover:text-orange-400 sm:text-xl">
              Ashfall Reborn
            </p>

            <p className="mt-1 hidden text-[11px] font-bold uppercase tracking-[0.13em] text-zinc-400 sm:block">
              US 2X Monthly · 8 Man · Vanilla+
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navItems.map(({ href, title }) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-[13px] font-extrabold uppercase tracking-wide transition ${path === href ? "bg-orange-500/15 text-orange-400" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
            >
              {title}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {!loggedIn ? (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg border border-zinc-700 px-4 py-2 text-sm font-bold uppercase tracking-wide transition hover:border-orange-500 hover:text-orange-500 lg:block"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="hidden rounded-lg bg-orange-600 px-4 py-2 text-sm font-black uppercase tracking-wide transition hover:bg-orange-700 lg:block"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="hidden rounded-lg border border-zinc-700 px-4 py-2 text-sm font-bold uppercase tracking-wide transition hover:border-orange-500 hover:text-orange-500 lg:block"
              >
                Profile
              </Link>

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="hidden rounded-lg border border-zinc-700 px-4 py-2 text-sm font-bold uppercase tracking-wide transition hover:border-red-500 hover:text-red-400 lg:block"
              >
                Logout
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="ashfall-mobile-navigation"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 text-white hover:border-orange-500/70 lg:hidden"
          >
            <span aria-hidden="true" className="text-2xl leading-none">{mobileOpen ? "×" : "☰"}</span>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav id="ashfall-mobile-navigation" className="grid max-h-[calc(100vh-5rem)] gap-1 overflow-y-auto border-t border-white/10 bg-[#0b0f13] px-4 py-4 sm:px-6 lg:hidden" aria-label="Mobile navigation">
          {navItems.map(({ href, title }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-current={path === href ? "page" : undefined}
              className={`rounded-lg px-4 py-3 text-sm font-black uppercase tracking-wide ${path === href ? "bg-orange-500/15 text-orange-400" : "text-zinc-200 hover:bg-white/10"}`}>
              {title}
            </Link>
          ))}
          {!loggedIn ? (
            <div className="mt-2 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg border border-white/20 px-4 py-3 text-center text-sm font-bold">Log in</Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="rounded-lg bg-orange-600 px-4 py-3 text-center text-sm font-bold">Sign up</Link>
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg border border-white/20 px-4 py-3 text-center text-sm font-bold">Profile</Link>
              <button type="button" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }} className="rounded-lg border border-white/20 px-4 py-3 text-sm font-bold">Log out</button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
