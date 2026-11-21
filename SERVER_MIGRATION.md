# Ashfall Reborn server migration

Current Rust connect address: `45.144.255.22:28015` (Steam query: `28017`)

Updated the three hard-coded Steam connect links and the server-status API.

## Required external setup

1. Find the **new** Rust server on BattleMetrics, verify its IP and game port, and set `BATTLEMETRICS_SERVER_ID` to its numeric ID in your deployment environment. Until then, the website displays status as `unknown` instead of showing the old server's status.
2. Update or install the Rust-to-website statistics reporter on the new Rust server. It must POST to `/api/player-stats` with the same `STATS_API_SECRET` configured in the website deployment. This reporter is **not** included in the website repository.
3. Decide whether old Supabase player stats, killfeed and online-player records should be archived/reset. This update does not delete data.
4. The old custom-map screenshot and unverified first-Friday wipe schedule are intentionally hidden. Shop/Kits are feature-gated off in `src/lib/siteFeatures.ts` until explicitly reopened. Old order fulfillment/webhooks remain enabled.
5. Deploy the updated Next.js project and verify that the Steam connect link launches Rust.

The new IP/port is not itself a Supabase connection string. Supabase continues to use its own URL and keys.
