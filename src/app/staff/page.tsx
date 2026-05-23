import Navbar from "../components/Navbar";

const staff = [
  {
    name: "DefyingKing",
    role: "Owner",
    icon: "👑",
    description:
      "Founder of Ashfall Reborn responsible for server management, development, and overall direction.",
  },
  {
    name: "Admin Team",
    role: "Administrators",
    icon: "🛡️",
    description:
      "Handles moderation, rule enforcement, exploit investigations, and player support.",
  },
  {
    name: "Moderators",
    role: "Community Staff",
    icon: "⚔️",
    description:
      "Supports the community, monitors gameplay, and helps maintain a competitive environment.",
  },
];

export default function StaffPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-6xl text-center fade-up">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
            Server Staff
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase">
            Meet The Team
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            The staff team works to keep Ashfall Reborn competitive, fair, and
            enjoyable for everyone.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {staff.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 transition duration-300 hover:-translate-y-2 hover:border-orange-500"
              >
                <div className="text-6xl">{member.icon}</div>

                <h2 className="mt-6 text-3xl font-black uppercase">
                  {member.name}
                </h2>

                <p className="mt-2 text-sm font-bold uppercase tracking-widest text-orange-500">
                  {member.role}
                </p>

                <p className="mt-4 text-zinc-400">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}