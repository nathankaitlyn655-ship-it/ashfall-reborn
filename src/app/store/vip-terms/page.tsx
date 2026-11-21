import Link from "next/link";

export const metadata = { title: "ASHFALL VIP Terms | ASHFALL REBORN" };

export default function VipTerms() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <Link href="/store" className="text-sm font-semibold text-orange-400">Back to ASHFALL VIP</Link>
        <h1 className="text-3xl font-black uppercase">ASHFALL VIP Subscription Terms</h1>
        <p className="text-sm text-zinc-400">Prepared November 21, 2026. VIP sales are not open until perks and billing are verified.</p>
        <section><h2 className="text-xl font-bold">Recurring billing</h2><p className="mt-2 text-zinc-300">ASHFALL VIP is $7.99 USD per month. If you subscribe when sales open, Stripe automatically charges your payment method each month until you cancel. This is a recurring subscription, not a one-time four-week purchase.</p></section>
        <section><h2 className="text-xl font-bold">Benefits and delivery</h2><p className="mt-2 text-zinc-300">Benefits will be listed on the VIP shop page when available. VIP status is attached to a Steam account verified through your ASHFALL website login. Activation can take a few minutes after Stripe confirms payment. Access depends on the Rust server and supported community services being available.</p></section>
        <section><h2 className="text-xl font-bold">Cancel anytime</h2><p className="mt-2 text-zinc-300">Use the website&apos;s Manage Subscription button to open the Stripe customer portal and cancel future renewals. When canceled at the end of a paid billing period, benefits remain until that period ends. If payment fails or the subscription expires, VIP benefits can be removed.</p></section>
        <section><h2 className="text-xl font-bold">Refunds and problems</h2><p className="mt-2 text-zinc-300">Digital subscription charges are generally not refunded for unused playtime or a change of mind, except where required by law or when benefits were not delivered as described. Contact ASHFALL support with your receipt and Steam account if access fails. Do not share card numbers or passwords.</p></section>
        <section><h2 className="text-xl font-bold">Fair play</h2><p className="mt-2 text-zinc-300">VIP is intended for cosmetic and convenience features, not paid weapons or resources. VIP never exempts players from team limits, raid rules, or staff moderation.</p></section>
        <Link href="/support" className="inline-block rounded-lg bg-orange-600 px-5 py-3 font-bold">Contact Support</Link>
      </article>
    </main>
  );
}
