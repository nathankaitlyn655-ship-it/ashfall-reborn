import Navbar from "../components/Navbar";

export default function LeaderboardsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">ASHFALL REBORN</p>
          <h1 className="mt-4 text-4xl font-black uppercase md:text-6xl">Wipe Leaderboards</h1>
          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">Official current-wipe standings are posted to our Discord leaderboard channel. Type <strong className="text-white">/leaderboard</strong> in-game to view the live rankings. Old website profile statistics are no longer displayed here.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7"><p className="text-4xl font-black text-orange-500">$15</p><h2 className="mt-3 font-bold">#1 PvP Kills</h2></div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7"><p className="text-4xl font-black text-orange-500">$10</p><h2 className="mt-3 font-bold">#1 Sulfur Mined</h2></div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7"><p className="text-4xl font-black text-orange-500">$20</p><h2 className="mt-3 font-bold">#1 Clan PvP Kills</h2><p className="mt-2 text-sm text-zinc-400">One total prize shared by the winning clan</p></div>
          </div>
          <p className="mt-8 text-sm text-zinc-500">Prizes are awarded after staff verification. Final wipe results are archived on the server before reset.</p>
        </section>
      </main>
    </>
  );
}
