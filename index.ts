// Deploy with JWT verification OFF; authenticate with the private shared secret.
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const expected = Deno.env.get("STATS_API_SECRET");
  if (!expected) return json({ error: "Server not configured" }, 503);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (typeof body.secret !== "string" || body.secret !== expected) return json({ error: "Unauthorized" }, 401);
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return json({ error: "Database not configured" }, 503);
  const db = createClient(url, key, { auth: { persistSession: false } });
  const steam = (v: unknown) => typeof v === "string" && /^7656119\d{10}$/.test(v) ? v : null;
  const name = (v: unknown) => typeof v === "string" ? v.slice(0, 100) : "Unknown";
  try {
    if (Array.isArray(body.onlinePlayers)) {
      const players = body.onlinePlayers.slice(0, 500).filter((p) => p && steam(p.steamId)).map((p) => ({ steam_id: p.steamId, display_name: name(p.displayName), last_seen: new Date().toISOString() }));
      if (players.length) { const { error } = await db.from("online_players").upsert(players, { onConflict: "steam_id" }); if (error) throw error; }
      // Clients should treat players as online only when last_seen is recent.
      return json({ success: true, type: "online_players", count: players.length });
    }
    const killerId = steam(body.killerSteamId);
    const victimId = steam(body.victimSteamId);
    const playId = steam(body.playtimeSteamId);
    if (playId) {
      const minutes = Number(body.playtimeMinutes);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) return json({ error: "Invalid playtime" }, 400);
      const { error } = await db.rpc("ashfall_add_stats", { p_steam_id: playId, p_name: name(body.playtimeName), p_kills: 0, p_deaths: 0, p_minutes: minutes });
      if (error) throw error;
      return json({ success: true, type: "playtime" });
    }
    if (!victimId) return json({ error: "Missing player event" }, 400);
    if (killerId && killerId !== victimId) {
      const { error } = await db.rpc("ashfall_add_stats", { p_steam_id: killerId, p_name: name(body.killerName), p_kills: 1, p_deaths: 0, p_minutes: 0 });
      if (error) throw error;
    }
    const { error: deathError } = await db.rpc("ashfall_add_stats", { p_steam_id: victimId, p_name: name(body.victimName), p_kills: 0, p_deaths: 1, p_minutes: 0 });
    if (deathError) throw deathError;
    const { error: feedError } = await db.from("killfeed").insert({ killer_name: killerId ? name(body.killerName) : "Unknown", killer_steam_id: killerId, victim_name: name(body.victimName), victim_steam_id: victimId, death_type: name(body.deathType || "environment") });
    if (feedError) throw feedError;
    return json({ success: true, type: "death" });
  } catch (error) { console.error("Ashfall stats write failed", error); return json({ error: "Database write failed" }, 500); }
});
