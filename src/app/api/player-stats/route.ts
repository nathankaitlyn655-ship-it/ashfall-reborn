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
      playtimeName,
      playtimeSteamId,
      playtimeMinutes,
    } = body;

    if (secret !== process.env.STATS_API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return NextResponse.json({ success: true, type: "death" });
  } catch {
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}