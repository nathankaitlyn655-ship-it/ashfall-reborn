export default function AuthCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,115,0,0.12),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-orange-500/20 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />

        <div className="relative grid gap-10 p-10 lg:grid-cols-2 lg:p-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.4em] text-orange-500">
              Ashfall Reborn
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-none">
              Join The Community
            </h2>

            <p className="mt-6 max-w-xl text-lg text-zinc-300">
              Create your Ashfall Reborn account to access support tickets,
              player dashboards, future stat tracking, leaderboards, and more.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/signup"
                className="rounded-xl bg-orange-600 px-8 py-4 text-lg font-black uppercase tracking-wide transition hover:scale-[1.02] hover:bg-orange-700"
              >
                Create Account
              </a>

              <a
                href="/login"
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-8 py-4 text-lg font-black uppercase tracking-wide transition hover:border-orange-500 hover:text-orange-500"
              >
                Login
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Player Dashboard", "Manage your account"],
              ["Support Tickets", "Direct admin replies"],
              ["Leaderboards", "Track top players"],
              ["Future Stats", "Kills, raids, playtime"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-orange-500"
              >
                <h3 className="text-2xl font-black uppercase text-orange-500">
                  {title}
                </h3>

                <p className="mt-3 text-zinc-400">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}