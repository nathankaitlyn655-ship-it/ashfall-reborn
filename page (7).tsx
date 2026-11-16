import Navbar from "../components/Navbar";

const wipes = [
  {
    date: "June 6, 2026",
    map: "Procedural Map",
    notes: "Full monthly wipe with new custom monuments and loot balancing.",
  },
  {
    date: "May 2, 2026",
    map: "Custom Map",
    notes: "Recycler updates, PvP improvements, and optimized events.",
  },
  {
    date: "April 4, 2026",
    map: "Large Custom Map",
    notes: "Server launch wipe with new progression balancing.",
  },
];

export default function WipesPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-5xl text-center fade-up">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
            Wipe History
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase">
            Monthly Wipes
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Ashfall Reborn wipes every first Friday of the month.
          </p>

          <div className="mt-12 space-y-6 text-left">
            {wipes.map((wipe) => (
              <div
                key={wipe.date}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-3xl font-black uppercase">
                      {wipe.date}
                    </h2>

                    <p className="mt-2 text-orange-500">
                      {wipe.map}
                    </p>
                  </div>

                  <div className="rounded-lg bg-orange-500/10 px-4 py-2 text-sm font-bold uppercase text-orange-500">
                    Monthly Wipe
                  </div>
                </div>

                <p className="mt-6 text-zinc-400">
                  {wipe.notes}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}