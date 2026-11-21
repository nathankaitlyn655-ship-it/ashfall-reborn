// Show the redesigned ASHFALL VIP shop. The old pay-to-win kit catalog stays hidden.
export const SHOP_ENABLED = true;
export const LEGACY_KITS_ENABLED = false;

// VIP checkout stays OFF until the Stripe recurring price, entitlement plugin,
// and all perks have been configured and checked end-to-end.
export const VIP_PURCHASES_ENABLED = process.env.VIP_CHECKOUT_READY === "true";
