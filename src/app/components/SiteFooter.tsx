import Link from "next/link";
import { SHOP_ENABLED } from "@/lib/siteFeatures";

export default function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-[#090c10] px-5 py-10 text-white sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <img src="/ashfall-logo.png" alt="ASHFALL REBORN" className="h-12 w-12 rounded-xl object-contain" />
          <div>
            <p className="font-black uppercase tracking-wide text-orange-500">Ashfall Reborn</p>
            <p className="mt-1 text-sm text-zinc-400">US 2X Monthly · 8-Man · Vanilla+</p>
          </div>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-zinc-300">
          <Link href="/rules" className="hover:text-orange-400">Rules</Link>
          <Link href="/leaderboards" className="hover:text-orange-400">Leaderboards</Link>
          <Link href="/support" className="hover:text-orange-400">Support</Link>
          {SHOP_ENABLED && <Link href="/store" className="hover:text-orange-400">VIP</Link>}
          <a href="https://discord.gg/M8DQXyqZpm" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400">Discord</a>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-7xl text-xs text-zinc-500">Community Rust server. Not affiliated with Facepunch Studios or Valve. Wipe prizes are subject to staff verification.</p>
    </footer>
  );
}
