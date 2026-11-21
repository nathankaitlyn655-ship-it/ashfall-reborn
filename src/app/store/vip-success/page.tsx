import Link from "next/link";

export default function VipSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-white">
      <h1 className="text-4xl font-black uppercase text-orange-500">ASHFALL VIP Subscription Submitted</h1>
      <p className="mt-5 max-w-xl text-zinc-300">Stripe is processing your subscription. VIP access activates only after confirmed payment and server-side verification. The server may take a few minutes to sync your entitlement.</p>
      <p className="mt-3 text-sm text-zinc-500">This page does not grant VIP privileges or confirm payment.</p>
      <Link href="/profile" className="mt-8 rounded-lg bg-orange-600 px-6 py-3 font-bold">Your Profile</Link>
    </main>
  );
}
