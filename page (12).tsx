"use client";

"use client";

import { supabase } from "../lib/supabaseClient";

export default function TestDBPage() {
  async function addTestPlayer() {
    const { data, error } = await supabase
      .from("player_profiles")
      .insert([
        {
          username: "Nathan",
          steam_id: "123456789",
          kills: 10,
          deaths: 4,
          raids: 2,
        },
      ]);

    console.log(data);
    console.log(error);

    alert(error ? "Error adding player" : "Player added!");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <button
        onClick={addTestPlayer}
        className="rounded-lg bg-orange-600 px-6 py-4 font-bold transition hover:bg-orange-700"
      >
        Add Test Player
      </button>
    </main>
  );
}