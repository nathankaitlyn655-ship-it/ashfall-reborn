import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      secret,

      killerName,
      victimName,
      killerSteamId,
      victimSteamId,
      deathType,

      playtimeName,
      playtimeSteamId,
      playtimeMinutes,

      onlinePlayers,
    } = body;

    if (secret !== process.env.STATS_API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /*
      ONLINE PLAYERS
      Expected:
      onlinePlayers: [
        { steamId: "123", displayName: "PlayerName" }
      ]
    */
    if (Array.isArray(onlinePlayers)) {
      const now = new Date().toISOString();

      const formattedPlayers = onlinePlayers
        .filter((player) => player.steamId && player.displayName)
        .map((player) => ({
          steam_id: player.steamId,
          display_name: player.displayName,
          last_seen: now,
        }));

      if (formattedPlayers.length > 0) {
        await supabase
          .from("online_players")
          .upsert(formattedPlayers, {
            onConflict: "steam_id",
          });
      }

      return NextResponse.json({
        success: true,
        type: "online_players",
        count: formattedPlayers.length,
      });
    }

    /*
      PLAYTIME TRACKING
    */
    if (playtimeSteamId && playtimeName && playtimeMinutes) {
      const { data: existingPlayer } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("steam_id_public", playtimeSteamId)
        .maybeSingle();

      if (existingPlayer) {
        await supabase
          .from("player_profiles")
          .update({
            playtime_minutes:
              (existingPlayer.playtime_minutes || 0) + Number(playtimeMinutes),
            username: existingPlayer.username || playtimeName,
            display_name: existingPlayer.display_name || playtimeName,
          })
          .eq("steam_id_public", playtimeSteamId);
      } else {
        await supabase.from("player_profiles").insert([
          {
            steam_id_public: playtimeSteamId,
            username: playtimeName,
            display_name: playtimeName,
            kills: 0,
            deaths: 0,
            raids: 0,
            playtime_minutes: Number(playtimeMinutes),
          },
        ]);
      }

      return NextResponse.json({ success: true, type: "playtime" });
    }

    /*
      KILL / DEATH TRACKING
    */
    if (killerSteamId && killerName) {
      const { data: existingKiller } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("steam_id_public", killerSteamId)
        .maybeSingle();

      if (existingKiller) {
        await supabase
          .from("player_profiles")
          .update({
            kills: (existingKiller.kills || 0) + 1,
            username: existingKiller.username || killerName,
            display_name: existingKiller.display_name || killerName,
          })
          .eq("steam_id_public", killerSteamId);
      } else {
        await supabase.from("player_profiles").insert([
          {
            steam_id_public: killerSteamId,
            username: killerName,
            display_name: killerName,
            kills: 1,
            deaths: 0,
            raids: 0,
            playtime_minutes: 0,
          },
        ]);
      }
    }

    if (victimSteamId && victimName) {
      const { data: existingVictim } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("steam_id_public", victimSteamId)
        .maybeSingle();

      if (existingVictim) {
        await supabase
          .from("player_profiles")
          .update({
            deaths: (existingVictim.deaths || 0) + 1,
            username: existingVictim.username || victimName,
            display_name: existingVictim.display_name || victimName,
          })
          .eq("steam_id_public", victimSteamId);
      } else {
        await supabase.from("player_profiles").insert([
          {
            steam_id_public: victimSteamId,
            username: victimName,
            display_name: victimName,
            kills: 0,
            deaths: 1,
            raids: 0,
            playtime_minutes: 0,
          },
        ]);
      }
    }

    if (victimSteamId && victimName) {
      await supabase.from("killfeed").insert([
        {
          killer_name: killerName || "Unknown",
          killer_steam_id: killerSteamId || null,
          victim_name: victimName,
          victim_steam_id: victimSteamId,
          death_type: deathType || "player",
        },
      ]);
    }

    return NextResponse.json({ success: true, type: "death" });
  } catch {
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}