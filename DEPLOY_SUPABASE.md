# Ashfall Reborn — Supabase deployment

## Important: frontend hosting
This is a Next.js 16 website. Supabase provides its database, authentication and Edge Functions; it does **not** deploy the Next.js frontend. Deploy the frontend on a Next.js-compatible host (e.g. Netlify, Cloudflare Workers with Next.js adapter, or a Node server). Connect your domain to that host. The GitHub repo alone does not publish it.

## 1. Prepare Supabase
1. Supabase dashboard → Project Settings → API: copy the **Project URL** and **publishable/anon key**. Never place the service-role key in frontend environment variables.
2. SQL Editor → inspect your existing `player_profiles`, `online_players` and `killfeed` tables. The provided migration assumes the columns used in the original website exist and `steam_id_public` can be unique. Back up data before applying.
3. SQL Editor → run `supabase/migrations/20261115_ashfall_stats.sql` after checking the assumptions. The RPC makes kill/death/playtime increments atomic.
4. Edge Functions → Secrets: set `STATS_API_SECRET` to a **newly rotated** random secret (the earlier secret was shared in chat). Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions by default.
5. Edge Functions → Deploy new function → via editor (paste `supabase/functions/player-stats/index.ts`) or Supabase CLI:
   `supabase login`
   `supabase link --project-ref YOUR_PROJECT_REF`
   `supabase functions deploy player-stats --no-verify-jwt`
   If deploying via dashboard, disable JWT verification for this function. It uses its own secret validation.
6. Edge Function URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/player-stats`

## 2. Rust plugin
Install `AshfallStats.cs` in `oxide/plugins`. In `oxide/config/AshfallStats.json`, set `Website API URL (HTTPS)` to the Edge Function URL and `STATS_API_SECRET (must match website environment variable)` to your rotated secret. Reload with `oxide.reload AshfallStats`. Do not commit that JSON to GitHub.

## 3. Frontend
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` on the **frontend host**, then deploy this Next.js repository there. The current public server connection address is `45.144.255.22:28015`. The site queries Supabase for its existing website-profile leaderboards. For the newer authenticated VPS status bridge and in-game prize leaderboard integration, follow `ASHFALL_WEBSITE_UPDATE_NOTES.md`.

## 4. Validate
Test a player joining for 60+ seconds, then a PvP death. Inspect Edge Function logs, Rust console, and Supabase `player_profiles` and `killfeed`. Online players are considered current only if `last_seen` is recent; old rows are not automatically deleted.

## Limitations
This integration has not been tested against your actual Supabase schema or Rust server. The plugin queues requests and retries failures, but events have no unique event IDs, so a response lost after a successful database write can result in duplicate counts. The provided migration may need adjustment for existing table constraints. The Edge Function handles writes; frontend deployment is separate.
