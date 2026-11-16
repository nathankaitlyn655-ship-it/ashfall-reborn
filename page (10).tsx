import Navbar from "../components/Navbar";

export default function RulesPage() {
  const rules = [
    "No cheating, scripting, exploiting, or third-party advantage tools.",
    "No racism, hate speech, harassment, or excessive toxicity.",
    "No ban evasion or playing with known cheaters.",
    "No abusing bugs, glitches, or unintended mechanics.",
    "No real-world threats, doxxing, or personal information sharing.",
    "Respect staff decisions. Staff may take action to protect server integrity.",
    "No pay-to-win abuse. Purchases support the server but do not override rules.",
    "Keep PvP competitive, fair, and within Rust’s intended gameplay.",
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-5xl text-center fade-up">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
            Server Rules
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase">
            Ashfall Reborn Rules
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Follow the rules, respect the community, and keep gameplay fair.
          </p>

          <div className="mt-12 grid gap-4 text-left">
            {rules.map((rule, index) => (
              <div
                key={rule}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <p className="font-bold text-orange-500">Rule {index + 1}</p>
                <p className="mt-2 text-zinc-300">{rule}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}