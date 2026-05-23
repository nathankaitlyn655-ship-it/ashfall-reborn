import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.battlemetrics.com/servers/39070026", {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch BattleMetrics server data");
    }

    const data = await res.json();
    const server = data.data.attributes;

    return NextResponse.json({
      name: server.name,
      status: server.status,
      players: server.players,
      maxPlayers: server.maxPlayers,
      rank: server.rank,
      ip: server.ip,
      port: server.port,
    });
  } catch {
    return NextResponse.json(
      {
        name: "Ashfall Reborn",
        status: "offline",
        players: 0,
        maxPlayers: 0,
        rank: null,
        ip: "198.73.57.143",
        port: 28025,
      },
      { status: 200 }
    );
  }
}