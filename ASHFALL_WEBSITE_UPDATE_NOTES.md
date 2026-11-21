# ASHFALL REBORN website refresh (November 2026)

## Current server identity

- Public name: `ASHFALL REBORN | US MONTHLY | 2x | 8 MAN | Vanilla+`
- Game/connect: `45.144.255.22:28015`
- Steam query: `45.144.255.22:28017`
- Website: `https://www.ashfallreborn.com`
- Server logo: `https://i.imgur.com/JMWSNKR.png` (served locally at `/ashfall-logo.png` from `public/ashfall-logo.png`)
- Header/banner: `https://i.imgur.com/gc7jBvm.png`
- Gameplay: monthly 2X gathering, smelting and recycling; 50% lower TC upkeep; max 8-person teams; light QoL plugins, not an unmodified vanilla server.

## Website content changes

- Updated links and server-status API to the VPS address.
- Added the new server logo/favicon and banner.
- Removed old 2X Modded and custom-map claims; replaced with Vanilla+ wording.
- Removed unverified previous wipe dates and first-Friday countdown. The homepage can show an actual countdown after `NEXT_PUBLIC_NEXT_WIPE_UTC` is set in deployment settings to a confirmed ISO 8601 timestamp, e.g. `2027-01-07T19:00:00Z` (example only, **not** a declared wipe time).
- Announced end-of-wipe prizes: $15 top eligible PvP killer, $10 top eligible sulfur miner, and **one $20 award to the entire winning clan**, based on qualifying clan PvP kills. Staff verification and anti-exploit review apply. Website profile rankings do not automatically mirror in-game leaderboard plugin records.
- The site now has an ASHFALL VIP landing page ($7.99 per calendar month). The previous VIP kits are still hidden and `/api/checkout` refuses old kit purchases. Old Stripe webhook and subscription checks remain for historical paid orders.
- VIP recurring payments remain **disabled** by default. `VIP_CHECKOUT_READY=true` must not be set until every promised perk, cancellation workflow, and webhook has been tested.
- `ServerStatus` and `Online Now` now use an authenticated VPS heartbeat, not a stale previous-server feed. Missing heartbeat shows an unavailable/unknown state instead of inventing zero connected players.
- The prize leaderboard page has a new live-wipe leaderboard panel above existing website account standings. This panel remains "awaiting sync" until the **actual** `AshfallLeaderboards.cs` plugin exports its current results (see below).

## Deploying to the existing GitHub/Vercel project

1. Deploy the updated repository to the **existing** `ashfall-reborn` Vercel project, using your normal main-branch deployment process.
2. Keep existing Supabase, Stripe and other Vercel environment variables configured; do **not** replace production variables with placeholder test values.
3. The `BATTLEMETRICS_SERVER_ID` value must refer to the **new VPS** BattleMetrics record if BattleMetrics status/rank is still desired. The new direct heartbeat takes precedence when available.
4. Confirm website navigation, `/ashfall-logo.png`, `steam://connect/45.144.255.22:28015`, the prize copy, `/store` (VIP preview), and `/api/checkout` (503 for old kits).
5. Run the two new SQL migrations and configure the live/VIP integrations below. Keep the production secret keys out of source control.

## Setup: real VPS player count and live player names

1. Open Supabase > SQL Editor and run `supabase/migrations/20261121_ashfall_live_snapshot.sql` in your existing Supabase project. (Review the SQL first.)
2. Open Vercel > Project > Settings > Environment Variables. Keep working `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` values; add `ASHFALL_BRIDGE_SECRET` with a strong random string of at least 32 characters. Redeploy so the API sees it.
3. Copy `rust_plugins/AshfallWebsiteLive.cs` to `C:\rustserver\oxide\plugins\AshfallWebsiteLive.cs` on the VPS.
4. Edit `C:\rustserver\oxide\config\AshfallWebsiteLive.json` and replace `CHANGE_ME` with the exact same `ASHFALL_BRIDGE_SECRET` configured in Vercel. Keep the default HTTPS URL unless your website domain changes.
5. In the Rust console: `oxide.reload AshfallWebsiteLive`. After around 30 seconds, `https://ashfallreborn.com/api/live-snapshot` should return `connected:true` and the actual live player list. If it doesn't, inspect the Rust console and Vercel function logs for HTTP/auth/database errors.
6. Only true connected Rust players are counted. No fake player population or stale old-server data is used.

## Setup: $7.99 monthly VIP subscriptions (do not enable until verified)

1. Review/run `supabase/migrations/20261121_ashfall_vip_membership.sql` in your existing Supabase project.
2. In Stripe **the same account as the current working webhook**, create the product **ASHFALL VIP** with an active **USD $7.99 recurring Monthly** price. Copy its `price_...` ID.
3. Add the **server-only** Vercel env var `ASHFALL_VIP_MONTHLY_PRICE_ID` with that price ID. Keep `VIP_CHECKOUT_READY` unset/false for now. Do not use a Stripe secret key in browser code.
4. Make sure your existing signed `/api/stripe/webhook` endpoint receives `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. Keep historical one-time kit fulfillment enabled for earlier buyers.
5. Copy `rust_plugins/AshfallVIP.cs` to `C:\rustserver\oxide\plugins\AshfallVIP.cs`. Set its config `ASHFALL_BRIDGE_SECRET` to match Vercel. Reload with `oxide.reload AshfallVIP`.
6. The VIP plugin checks only verified Stripe subscriptions and grants/revokes `ashfallvip.member` to the matched SteamID. This permission alone **does not implement** Skinbox, box sorter, queue priority, team auto-auth, chat color or Discord role tools. Install/configure and verify those integrations individually first. An existing Skinbox or other plugin does not automatically adopt this new permission; it must be configured or integrated.
7. Once the perks work end to end, test the new checkout/webhook/cancel/revoke/renewal flow with **Stripe test-mode keys and a separate $7.99 test monthly Price**. Switch to the correct live Price ID and only then set `VIP_CHECKOUT_READY=true` and redeploy. Confirm the Stripe customer portal allows cancellation.
8. Each customer must link their Steam account on the website. Checkout, signed Stripe webhooks, the private DB record and the VIP entitlement API determine access. The success page **does not** itself award VIP.

## In-game leaderboard syncing

The website supports `leaderboards: { pvp: [{name,value}], sulfur: [{name,value}], clans: [{name,value,members}] }` as a verified field inside the authenticated live-snapshot heartbeat. The provided `AshfallWebsiteLive.cs` plugin sends only connected-player data; it deliberately does not invent standings. To populate the web rankings accurately from the in-game prize leaderboard, provide the **current** `AshfallLeaderboards.cs` (and relevant `AshfallClans.cs`) source so an export hook can be added and the live bridge can call it without duplicating kill/sulfur/clan calculations.

The ZIP does not deploy itself to Vercel/VPS or change your existing database. All migrations and plugins require the owner to install and verify them on their own systems.
