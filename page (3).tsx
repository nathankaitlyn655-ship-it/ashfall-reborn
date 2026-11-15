import Navbar from "../components/Navbar";

export default function MapPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-7xl text-center fade-up">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
            Server Map
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase">
            Ashfall Reborn Map
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Explore the official Ashfall Reborn custom Rust map with monuments,
            PvP hotspots, outpost, bandit, recyclers, and key locations.
          </p>

          <div className="mt-12 overflow-hidden rounded-3xl border border-orange-500/30 bg-zinc-900 shadow-2xl shadow-orange-500/10">
            <img
              src="https://i.imgur.com/ZN9yiyS.png"
              alt="Ashfall Reborn Custom Map"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-black uppercase text-orange-500">
                Custom Monuments
              </h2>

              <p className="mt-4 text-zinc-400">
                Built around high-value areas, roaming routes, and PvP-focused
                progression.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-black uppercase text-orange-500">
                Balanced Layout
              </h2>

              <p className="mt-4 text-zinc-400">
                Snow, desert, forest, ocean, roads, rivers, and monuments are
                placed for active gameplay.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-black uppercase text-orange-500">
                PvP Hotspots
              </h2>

              <p className="mt-4 text-zinc-400">
                Designed for roaming, counters, raids, monument fights, and
                long-term monthly gameplay.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}