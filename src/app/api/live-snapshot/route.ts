import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { adminDb } from "@/lib/steamLinkServer";
import { getLiveSnapshot } from "@/lib/ashfallLive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  const snapshot = await getLiveSnapshot();
  return NextResponse.json(
    snapshot ? { connected: true, ...snapshot } : { connected: false, playerCount: null, onlinePlayers: [], leaderboards: null },
    { headers }
  );
}

type Payload = { onlinePlayers?: unknown; maxPlayers?: unknown; leaderboards?: unknown };

function safeName(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

function parseEntries(value: unknown, clans = false) {
  if (!Array.isArray(value) || value.length > 50) return null;
  const output: Array<{ name: string; value: number; members?: number }> = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const name = safeName(entry.name);
    const count = entry.value;
    if (!name || !Number.isInteger(count) || count < 0 || count > 1_000_000_000) return null;
    const next: { name: string; value: number; members?: number } = { name, value: count };
    if (clans && Number.isInteger(entry.members) && entry.members >= 1 && entry.members <= 8) {
      next.members = entry.members;
    }
    output.push(next);
  }
  return output;
}

export async function POST(request: NextRequest) {
  const expected = process.env.ASHFALL_BRIDGE_SECRET;
  const supplied = request.headers.get("x-ashfall-bridge-key") ?? "";
  const a = Buffer.from(expected ?? "");
  const b = Buffer.from(supplied);
  if (!expected || expected.length < 32 || a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  if (Number(request.headers.get("content-length")) > 60_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413, headers });
  }
  let body: Payload;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers }); }

  if (!body || typeof body !== "object" || !Array.isArray(body.onlinePlayers) || body.onlinePlayers.length > 500) {
    return NextResponse.json({ error: "Invalid player list" }, { status: 400, headers });
  }

  const players: Array<{ steamId: string; displayName: string }> = [];
  const ids = new Set<string>();
  for (const player of body.onlinePlayers) {
    if (!player || typeof player !== "object" || typeof player.steamId !== "string" ||
        !/^7656119\d{10}$/.test(player.steamId) || ids.has(player.steamId)) {
      return NextResponse.json({ error: "Invalid or duplicate Steam ID" }, { status: 400, headers });
    }
    ids.add(player.steamId);
    players.push({ steamId: player.steamId, displayName: safeName(player.displayName) || "Rust Player" });
  }

  const max = Number(body.maxPlayers);
  if (!Number.isInteger(max) || max < 1 || max > 500) {
    return NextResponse.json({ error: "Invalid maxPlayers" }, { status: 400, headers });
  }

  const record: Record<string, unknown> = {
    id: "ashfall",
    online_players: players,
    player_count: players.length,
    max_players: max,
    updated_at: new Date().toISOString(),
  };

  if (body.leaderboards !== undefined) {
    if (!body.leaderboards || typeof body.leaderboards !== "object") {
      return NextResponse.json({ error: "Invalid leaderboard data" }, { status: 400, headers });
    }
    const lb = body.leaderboards as Record<string, unknown>;
    const pvp = parseEntries(lb.pvp);
    const sulfur = parseEntries(lb.sulfur);
    const clans = parseEntries(lb.clans, true);
    if (!pvp || !sulfur || !clans) {
      return NextResponse.json({ error: "Invalid leaderboard rows" }, { status: 400, headers });
    }
    record.leaderboards = { pvp, sulfur, clans };
  }

  try {
    const { error } = await adminDb().from("ashfall_live_snapshot").upsert(record, { onConflict: "id" });
    if (error) throw error;
    return NextResponse.json({ success: true, players: players.length }, { headers });
  } catch (error) {
    console.error("ASHFALL live snapshot write failed", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503, headers });
  }
}
