// Server-authoritative pricing; never accept prices from the browser.
export const stripeKits = {
  airdrop: { name: "Airdrop - 14 days", cents: 799, days: 14, dbKit: "airdrop" },
  vip1: { name: "VIP Tier 1 - 30 days", cents: 1000, days: 30, dbKit: "vip1" },
  vip2: { name: "VIP Tier 2 - 30 days", cents: 1500, days: 30, dbKit: "vip2" },
  vip3: { name: "VIP Tier 3 - 30 days", cents: 2000, days: 30, dbKit: "vip3" },
  builder: { name: "VIP Builder - 30 days", cents: 999, days: 30, dbKit: "vipbuilder" },
} as const;
export type StoreKitId = keyof typeof stripeKits;
export function isStoreKitId(value: string): value is StoreKitId { return Object.prototype.hasOwnProperty.call(stripeKits, value); }
