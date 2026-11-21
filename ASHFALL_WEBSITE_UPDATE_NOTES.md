# ASHFALL REBORN website refresh (November 2026)

## Current server identity

- Public name: `ASHFALL REBORN | US MONTHLY | 2x | 8 MAN | Vanilla+`
- Game/connect: `45.144.225.22:28015`
- Steam query: `45.144.225.22:28017`
- Website: `https://www.ashfallreborn.com`
- Server logo: `https://i.imgur.com/JMWSNKR.png` (also saved as `src/app/favicon.png`)
- Header/banner: `https://i.imgur.com/gc7jBvm.png`
- Gameplay: monthly 2X gathering, smelting and recycling; 50% lower TC upkeep; max 8-person teams; light QoL plugins, not an unmodified vanilla server.

## Website content changes

- Updated links and server-status API to the VPS address.
- Added the new server logo/favicon and banner.
- Removed old 2X Modded and custom-map claims; replaced with Vanilla+ wording.
- Removed unverified previous wipe dates and first-Friday countdown. The homepage can show an actual countdown after `NEXT_PUBLIC_NEXT_WIPE_UTC` is set in deployment settings to a confirmed ISO 8601 timestamp, e.g. `2027-01-07T19:00:00Z` (example only, **not** a declared wipe time).
- Announced end-of-wipe prizes: $15 top eligible PvP killer, $10 top eligible sulfur miner, and **one $20 award to the entire winning clan**, based on qualifying clan PvP kills. Staff verification and anti-exploit review apply. Website profile rankings do not automatically mirror in-game leaderboard plugin records.
- Shop and kits are paused with `SHOP_ENABLED = false` in `src/lib/siteFeatures.ts`. The storefront still exists at `src/app/store/Storefront.tsx`, but `/store` responds as not found; fresh `/api/checkout` requests return HTTP 503. Stripe webhook and subscription checks remain for historical paid orders.

## Deploying to the existing GitHub/Vercel project

1. Deploy the updated repository to the **existing** `ashfall-reborn` Vercel project, using your normal main-branch deployment process.
2. Keep existing Supabase, Stripe and other Vercel environment variables configured; do **not** replace production variables with placeholder test values.
3. The `BATTLEMETRICS_SERVER_ID` value must refer to the **new VPS** BattleMetrics record to show live status. The API deliberately rejects old-IP data.
4. Confirm website navigation, new logo, `steam://connect/45.144.225.22:28015`, the prize copy, `/store` (404), and `/api/checkout` (503). Confirm previous purchases/webhooks remain operational.
5. To reopen the store, change `SHOP_ENABLED` to `true` and redeploy after reviewing paid-kit offerings and server policy.

The Rust server, Oxide plugins, Steam, VPS ports, Discord bots and database records are not modified by this website update.
