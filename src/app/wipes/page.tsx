import Navbar from "../components/Navbar";

export default function WipesPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-4xl text-center fade-up">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
            ASHFALL REBORN
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase">
            Monthly Wipes
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Our US 2X Monthly Vanilla+ server follows a monthly wipe cycle.
            We announce confirmed dates, times and any schedule changes in Discord.
          </p>

          <div className="mt-12 rounded-3xl border border-orange-500/30 bg-zinc-900 p-10">
            <h2 className="text-2xl font-black uppercase text-orange-500">Check the Next Wipe</h2>
            <p className="mt-4 text-zinc-300">Type <strong>/wipe</strong> in game or follow our Discord announcements.</p>
            <a href="https://discord.gg/M8DQXyqZpm" target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-lg bg-orange-600 px-6 py-3 font-black uppercase hover:bg-orange-700">Join Discord</a>
          </div>
          <p className="mt-8 text-sm text-zinc-500">Previous wipe history will appear here after dates have been verified.</p>
        </section>
      </main>
    </>
  );
}
