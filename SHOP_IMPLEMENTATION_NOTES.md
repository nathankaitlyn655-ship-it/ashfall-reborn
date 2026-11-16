# Ashfall Reborn premium store — Phase 1

- Replaces the old Tip4Serv store page with five reviewed packages, filters, and a cart preview.
- Checkout is intentionally **disabled**. No real payments, subscriptions, or Rust deliveries are connected.
- `src/app/store/catalog.ts` contains proposed products and item shortnames; these have NOT been validated against a live Rust item registry.
- Existing AshfallKits v1.2.6 deletes VIP definitions at startup and only has one shared VIP permission. Do not deploy paid permissions until a separate reviewed plugin update is complete.
- Items not precisely specified in the conversation remain unresolved: Tier 1 roadsign armor pieces; Tier 2 full roadsign set; Builder electrical starter set; actual airdrop behavior. Do not silently invent these quantities.
- Prices for Airdrop ($7.99/14 days) and Builder ($9.99/30 days) remain proposed.
- Subscription payments need Square merchant approval, verified webhook processing, authenticated Steam ownership, idempotent Rust fulfillment and expiry handling.
- Check current Facepunch monetization policy before accepting payments for combat perks.
