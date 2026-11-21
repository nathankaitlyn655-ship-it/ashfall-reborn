import Link from "next/link";
export default function CheckoutSuccess() {
  return <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-white">
    <h1 className="text-4xl font-black text-orange-500">Payment submitted</h1>
    <p className="mt-5 max-w-lg text-zinc-300">Stripe is confirming your payment. Your kit access is activated only after payment verification. Please allow a moment before claiming your kit in Rust.</p>
    <Link href="/support" className="mt-8 rounded-lg bg-orange-600 px-6 py-3 font-bold">Contact Support</Link>
  </main>;
}
