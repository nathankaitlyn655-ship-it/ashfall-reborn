import Link from "next/link";

export const metadata = { title: "Purchase & Refund Policy | Ashfall Reborn" };

export default function PurchasePolicy() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <article className="mx-auto max-w-3xl space-y-7 rounded-2xl border border-zinc-800 bg-zinc-900 p-7 sm:p-10">
        <Link href="/" className="text-sm font-semibold text-orange-400 hover:underline">← Back to ASHFALL REBORN</Link>
        <h1 className="text-3xl font-black">Purchase &amp; Refund Policy</h1>
        <p className="text-sm text-zinc-400">Ashfall Reborn · Effective November 16, 2026</p>
        <section className="space-y-2"><h2 className="text-xl font-bold">Digital purchases</h2><p>Purchases provide time-limited access to virtual kits and benefits on the Ashfall Reborn Rust server. No physical goods are shipped. Kit contents, claim intervals, prices, and access periods are described on the store before purchase.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-bold">One-time payment and expiration</h2><p>Every purchase is a one-time charge, not an automatically renewing subscription. Airdrop access lasts 14 days; VIP Tier 1, Tier 2, Tier 3, and VIP Builder access lasts 30 days per purchase. Access expires unless you make another purchase. Renewing an active package extends its remaining access time.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-bold">Kit claims</h2><p>Airdrop and VIP Tier 1–3 kits have a 24-hour claim cooldown. VIP Builder has a 7-day claim cooldown. Purchasing additional time does not reset an existing claim cooldown. Purchases are tied to the verified Steam account used at checkout.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-bold">Refund policy</h2><p>Because these are digital, time-limited server benefits, all sales are generally final. We do not offer refunds for change of mind, unused claim opportunities, or failure to play during an access period. This policy does not limit refunds or other remedies required by applicable law, including for purchases that were not delivered as described.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-bold">Problems with delivery</h2><p>If your paid kit does not activate, contact Ashfall Reborn server support with your purchase date and Stripe receipt so we can investigate and provide the purchased access or an appropriate remedy. Do not share your payment card details or account passwords.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-bold">Payment disputes</h2><p>Payment disputes and chargebacks are handled through the payment provider and applicable rules. Fraudulent or reversed payments may result in the corresponding virtual benefits being revoked, subject to applicable law.</p></section>
        <p className="border-t border-zinc-800 pt-5 text-sm text-zinc-400">This policy applies to purchases from the official Ashfall Reborn store. Review it before checkout.</p>
      </article>
    </main>
  );
}
