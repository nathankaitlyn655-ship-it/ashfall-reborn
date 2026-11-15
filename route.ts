import { NextResponse } from "next/server";

// The connect address is authoritative. BattleMetrics is optional and must be
// configured with the NEW server's ID; never display the old server's stats.
const SERVER_IP = "165.217.132.173";
const SERVER_PORT = 28015;
const SERVER_NAME = "Ashfall Reborn";

export async function GET() {
  const id = process.env.BATTLEMETRICS_SERVER_ID;
  if (id && /^\d+$/.test(id)) {
    try {
      const res = await fetch(`https://api.battlemetrics.com/servers/${id}`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) throw new Error("BattleMetrics request failed");
      const data = await res.json();
      const server = data?.data?.attributes;
      // Prevent an accidentally configured old BattleMetrics ID from showing
      // player counts or status for a different Rust server.
      if (server?.ip === SERVER_IP && Number(server?.port) === SERVER_PORT) {
        return NextResponse.json({
          name: server.name ?? SERVER_NAME,
          status: server.status ?? "unknown",
          players: server.players ?? null,
          maxPlayers: server.maxPlayers ?? null,
          rank: server.rank ?? null,
          ip: SERVER_IP,
          port: SERVER_PORT,
        });
      }
      console.warn("BattleMetrics server address does not match Ashfall Reborn's configured server");
    } catch (error) {
      console.error("Unable to retrieve BattleMetrics server status", error);
    }
  }
  return NextResponse.json({
    name: SERVER_NAME,
    status: "unknown",
    players: null,
    maxPlayers: null,
    rank: null,
    ip: SERVER_IP,
    port: SERVER_PORT,
  });
}
