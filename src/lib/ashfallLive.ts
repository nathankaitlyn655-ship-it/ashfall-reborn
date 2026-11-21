import { adminDb } from "@/lib/steamLinkServer";

export type LivePlayer = {
  steamId: string;
  displayName: string;
};

export type LeaderboardEntry = {
  name: string;
  value: number;
};

export type ClanLeaderboardEntry = LeaderboardEntry & { members?: number };

export type WipeLeaderboards = {
  pvp: LeaderboardEntry[];
  sulfur: LeaderboardEntry[];
  clans: ClanLeaderboardEntry[];
};

export type LiveSnapshot = {
  playerCount: number;
  maxPlayers: number;
  onlinePlayers: LivePlayer[];
  updatedAt: string;
  leaderboards: WipeLeaderboards | null;
};

export async function getLiveSnapshot(): Promise<LiveSnapshot | null> {
  try {
    const { data, error } = await adminDb()
      .from("ashfall_live_snapshot")
      .select("player_count,max_players,online_players,leaderboards,updated_at")
      .eq("id", "ashfall")
      .maybeSingle();
    if (error || !data) return null;

    const updated = Date.parse(data.updated_at);
    // A crashed/offline VPS must not remain marked ONLINE indefinitely.
    if (!Number.isFinite(updated) || Date.now() - updated > 120_000 || updated > Date.now() + 30_000) {
      return null;
    }

    const onlinePlayers: LivePlayer[] = Array.isArray(data.online_players)
      ? data.online_players.filter((value: unknown): value is LivePlayer =>
          !!value && typeof value === "object" &&
          "steamId" in value && typeof value.steamId === "string" &&
          "displayName" in value && typeof value.displayName === "string")
      : [];

    const leaderboards: WipeLeaderboards | null = data.leaderboards &&
      Array.isArray(data.leaderboards.pvp) &&
      Array.isArray(data.leaderboards.sulfur) &&
      Array.isArray(data.leaderboards.clans)
        ? data.leaderboards
        : null;

    return {
      playerCount: onlinePlayers.length,
      maxPlayers: Number(data.max_players) || 200,
      onlinePlayers,
      updatedAt: data.updated_at,
      leaderboards,
    };
  } catch (error) {
    console.error("ASHFALL live snapshot unavailable", error);
    return null;
  }
}
