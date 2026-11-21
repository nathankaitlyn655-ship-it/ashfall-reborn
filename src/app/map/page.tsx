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
            ASHFALL REBORN currently runs a 3,500-size procedural Rust map.
            The current wipe map preview is being prepared; use your in-game map
            for up-to-date monuments, roads and points of interest.
          </p>

          {/* Old custom-map preview is intentionally hidden until a current map is available. */}
          <div className="mt-12 rounded-3xl border border-orange-500/30 bg-zinc-900 p-12 text-center shadow-2xl shadow-orange-500/10">
            <p className="text-2xl font-black uppercase text-orange-500">Procedural Map • 3,500 Size</p>
            <p className="mt-3 text-zinc-400">Visit 45.144.255.22:28015 and press G to view the current map in Rust.</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-black uppercase text-orange-500">
                Familiar Monuments
              </h2>

              <p className="mt-4 text-zinc-400">
                Discover standard Rust monuments and contest valuable loot
                with balanced 2X progression.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-black uppercase text-orange-500">
                Balanced Layout
              </h2>

              <p className="mt-4 text-zinc-400">
                A procedural Rust world with varied terrain, resources, and
                areas for building and roaming.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-black uppercase text-orange-500">
                PvP Hotspots
              </h2>

              <p className="mt-4 text-zinc-400">
                Monthly wipes leave time for roaming, counters, raids and
                monument fights.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
