"use client";

import { useEffect, useMemo, useState } from "react";
import premiumKits from "../../lib/premium-kits.json";
import Navbar from "../components/Navbar";
import { supabase } from "@/lib/supabaseClient";

type Product = { id: string; name: string; price: number; duration: string; cooldown: string; category: "VIP" | "Kits"; icon: string; tag: string; description: string; highlights: string[]; featured?: boolean };

const products: Product[] = [
  { id: "airdrop", name: "Airdrop Subscription", price: 7.99, duration: "14 days", cooldown: "Every 24 hours", category: "Kits", icon: "🪂", tag: "Two-week access", description: "Claim 3 Supply Signals every 24 hours throughout your 14-day access period.", highlights: ["3 Supply Signals per claim", "14-day access", "24-hour claim cooldown", "No bonus components"] },
  { id: "vip1", name: "VIP Tier 1", price: 10, duration: "30 days", cooldown: "Every 24 hours", category: "VIP", icon: "🛡️", tag: "Survivor", description: "The original Tier 1 kit, including early-game weapons, armor, medical supplies, scrap and components.", highlights: ["Revolver + Double Barrel", "64 pistol rounds + 24 shells", "2 roadsign armor pieces + 5 syringes", "150 scrap + components"] },
  { id: "vip2", name: "VIP Tier 2", price: 15, duration: "30 days", cooldown: "Every 24 hours", category: "VIP", icon: "⚔️", tag: "Raider", description: "A stronger VIP kit than Tier 1, with upgraded supplies and a larger component allowance.", highlights: ["Improved over Tier 1", "More components and supplies", "24-hour claim cooldown"], featured: true },
  { id: "vip3", name: "VIP Tier 3", price: 20, duration: "30 days", cooldown: "Every 24 hours", category: "VIP", icon: "👑", tag: "Warlord", description: "The highest VIP tier, with the strongest premium kit and largest component allowance.", highlights: ["Highest VIP tier", "Top component allowance", "24-hour claim cooldown"] },
  { id: "builder", name: "VIP Builder", price: 9.99, duration: "30 days", cooldown: "Every 7 days", category: "Kits", icon: "🏗️", tag: "Fortress", description: "A base-building support package with materials, components and turret-related supplies.", highlights: ["Base building materials", "Turret-related supplies", "Components included", "7-day claim cooldown"] },
];

const money = (amount: number) => `$${amount.toFixed(2)}`;

export default function StorePage() {
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  async function checkout() {
    if (!cart.length || checkingOut || !acceptedPolicy) return;
    setCheckoutError(""); setCheckingOut(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Log in and link your Steam account before checkout.");
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ kitIds: cart, acceptedPolicy: true }) });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Unable to start checkout.");
      window.location.assign(result.url);
    } catch (err) { setCheckoutError(err instanceof Error ? err.message : "Checkout unavailable."); setCheckingOut(false); }
  }
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewKitKey = previewId === "builder" || previewId === "vipbuilder" ? "vipbuilder" : previewId;
  const previewKit = previewKitKey ? premiumKits[previewKitKey as keyof typeof premiumKits] : null;
  const previewProduct = previewId ? products.find(p => p.id === previewId) : undefined;
  useEffect(() => {
    if (!showCart && !previewId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setShowCart(false); setPreviewId(null); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCart, previewId]);
  const visible = category === "All" ? products : products.filter(p => p.category === category);
  const cartProducts = useMemo(() => cart.map(id => products.find(p => p.id === id)).filter((p): p is Product => Boolean(p)), [cart]);
  const total = cartProducts.reduce((sum, p) => sum + p.price, 0);
  return <>
    <Navbar />
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="relative overflow-hidden border-b border-orange-500/20 px-6 py-24 text-center" style={{backgroundImage:"linear-gradient(rgba(9,9,11,.83),rgba(9,9,11,.96)),url(https://i.imgur.com/OCzWrRI.png)",backgroundPosition:"center",backgroundSize:"cover"}}>
        <p className="text-sm font-bold uppercase tracking-[.3em] text-orange-500">Official Ashfall Reborn Store</p>
        <h1 className="mt-4 text-4xl font-black uppercase md:text-6xl">Premium Kits & VIP</h1>
        <p className="mx-auto mt-5 max-w-2xl text-zinc-300">Support Ashfall Reborn with monthly VIP access, builder supplies and a 14-day airdrop package.</p>
        <div className="mt-8 flex justify-center"><button type="button" onClick={() => setShowCart(v => !v)} className="rounded-xl border border-orange-500 bg-zinc-900 px-6 py-3 font-bold hover:bg-zinc-800">🛒 Cart ({cart.length}) · {money(total)}</button></div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-9 flex flex-wrap justify-center gap-3">{["All","VIP","Kits"].map(c => <button type="button" key={c} onClick={() => setCategory(c)} className={`rounded-lg px-5 py-2 font-bold ${category === c ? "bg-orange-600" : "border border-zinc-700 bg-zinc-900"}`}>{c}</button>)}</div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{visible.map(p => <article key={p.id} className={`flex flex-col rounded-2xl border p-7 ${p.featured ? "border-orange-500 bg-orange-500/10" : "border-zinc-800 bg-zinc-900/80"}`}>
          <div className="text-5xl">{p.icon}</div><p className="mt-5 text-xs font-bold uppercase tracking-widest text-orange-500">{p.tag}</p><h2 className="mt-2 text-2xl font-black uppercase">{p.name}</h2>
          <div className="mt-3 text-3xl font-black text-orange-500">{money(p.price)} <span className="text-sm font-normal text-zinc-400">/ {p.duration}</span></div>
          <p className="mt-2 text-sm font-semibold text-zinc-300">Claim: {p.cooldown}</p><p className="mt-4 text-zinc-400">{p.description}</p>
          <ul className="my-5 space-y-2 text-sm text-zinc-300">{p.highlights.map(h => <li key={h}>✓ {h}</li>)}</ul>
          <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
            <button type="button" onClick={() => setPreviewId(p.id)} className="rounded-lg border border-orange-500 px-3 py-3 font-bold text-orange-400 hover:bg-orange-500/10">Preview Kit</button>
            <button type="button" onClick={() => {setCart(items => [...items,p.id]);setShowCart(true);}} className="rounded-lg bg-orange-600 px-3 py-3 font-bold hover:bg-orange-500">Add to Cart</button>
          </div>
        </article>)}</div>
        <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center text-sm text-zinc-400">All purchases are one-time payments. Access expires after 14 or 30 days unless you manually renew. Purchases are generally final, except where required by law. <a href="/store/purchase-policy" className="text-orange-400 underline">Read our Purchase &amp; Refund Policy</a>.</div>
      </section>
      {previewId && !previewKit && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-6"><div className="rounded-xl border border-orange-500 bg-zinc-950 p-8"><p className="font-bold">Kit inventory unavailable. Please contact an administrator.</p><button type="button" onClick={() => setPreviewId(null)} className="mt-4 rounded-lg bg-orange-600 px-5 py-2">Close</button></div></div>}
      {previewKit && previewProduct && <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6" role="presentation">
        <button type="button" aria-label="Close kit preview" onClick={() => setPreviewId(null)} className="absolute inset-0 bg-black/85" />
        <section role="dialog" aria-modal="true" aria-label={`${previewProduct.name} kit preview`} className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-orange-500/40 bg-zinc-950 shadow-2xl">
          <header className="flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-900 px-5 py-5 sm:px-7">
            <div><p className="text-xs font-bold uppercase tracking-[.25em] text-orange-500">Ashfall Reborn · Kit Inventory</p><h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">{previewProduct.name}</h2><p className="mt-1 text-sm text-zinc-400">{previewKit.description} · {previewProduct.cooldown}</p></div>
            <button type="button" onClick={() => setPreviewId(null)} className="shrink-0 rounded-lg border border-zinc-700 px-3 py-2 font-bold hover:bg-zinc-800" aria-label="Close preview">✕</button>
          </header>
          <div className="overflow-y-auto px-4 py-5 sm:px-7">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">Full contents · {previewKit.items.length} item types per claim</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
              {previewKit.items.map(item => <div key={item.shortname} className="group min-w-0 rounded-lg border border-zinc-700 bg-zinc-800/80 p-2" title={`${item.name} x${item.amount.toLocaleString()}`}>
                <div className="relative aspect-square rounded-md bg-zinc-900/80 p-1">
                  <img src={`https://rustlabs.com/img/items180/${item.shortname}.png`} alt={item.name} loading="lazy" className="h-full w-full object-contain" onError={e => { e.currentTarget.style.display = "none"; }} />
                  <span className="absolute bottom-0 right-0 rounded bg-black/85 px-1 text-xs font-black text-white">x{item.amount.toLocaleString()}</span>
                </div>
                <p className="mt-2 min-h-8 break-words text-center text-[11px] leading-tight text-zinc-200">{item.name}</p>
              </div>)}
            </div>
            <p className="mt-4 text-xs text-zinc-500">Rust inventory item icons. If an external icon is unavailable, the item name and quantity remain visible.</p>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-900 px-5 py-4 sm:px-7">
            <p className="text-xl font-black text-orange-500">{money(previewProduct.price)} <span className="text-xs font-normal text-zinc-400">/ {previewProduct.duration}</span></p>
            <button type="button" onClick={() => { setCart(items => [...items,previewProduct.id]); setPreviewId(null); setShowCart(true); }} className="rounded-lg bg-orange-600 px-6 py-3 font-bold hover:bg-orange-500">Add to Cart</button>
          </footer>
        </section>
      </div>}
      {showCart && <div className="fixed inset-0 z-[100] flex justify-end" role="presentation">
        <button type="button" aria-label="Close shopping cart" onClick={() => setShowCart(false)} className="absolute inset-0 bg-black/75" />
        <aside role="dialog" aria-modal="true" aria-label="Your shopping cart" className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-orange-500/40 bg-zinc-950 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
            <div><p className="text-xs font-bold uppercase tracking-widest text-orange-500">Ashfall Reborn</p><h2 className="mt-1 text-2xl font-black">Your Cart ({cart.length})</h2></div>
            <button type="button" onClick={() => setShowCart(false)} aria-label="Close cart" className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white">✕ Close</button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {cartProducts.length === 0 ? <p className="text-zinc-400">Your cart is empty. Add a kit to get started.</p> : <div className="space-y-4">{cartProducts.map((p,i) => <div key={`${p.id}-${i}`} className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="min-w-0"><p className="font-bold">{p.icon} {p.name}</p><p className="mt-1 text-xs text-zinc-400">{p.duration} access</p><button type="button" onClick={() => setCart(items => items.filter((_,index) => index !== i))} className="mt-3 text-sm font-semibold text-orange-400 hover:text-orange-300">Remove</button></div>
              <span className="shrink-0 font-bold">{money(p.price)}</span>
            </div>)}</div>}
          </div>
          <div className="border-t border-zinc-800 bg-zinc-900 px-6 py-6">
            <div className="mb-5 flex justify-between text-xl font-black"><span>Total</span><span className="text-orange-500">{money(total)}</span></div>
            <label className="mb-4 flex cursor-pointer items-start gap-3 text-sm text-zinc-200">
              <input type="checkbox" checked={acceptedPolicy} onChange={e => setAcceptedPolicy(e.target.checked)} className="mt-1 h-4 w-4 accent-orange-500" />
              <span>I understand these are one-time digital purchases with no automatic renewal. I have read and agree to the <a href="/store/purchase-policy" target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-400 underline">Purchase &amp; Refund Policy</a>, including that sales are generally final except where required by law.</span>
            </label>
            <button type="button" onClick={checkout} disabled={!cart.length || checkingOut || !acceptedPolicy} className="w-full rounded-lg bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-700">{checkingOut ? "Opening secure checkout..." : "Secure Checkout"}</button>
            {checkoutError && <p role="alert" className="mt-3 text-sm text-red-400">{checkoutError}</p>}
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">One-time purchase. No automatic renewal. Log in and verify Steam first. Your kit activates after Stripe confirms payment.</p>
          </div>
        </aside>
      </div>}
    </main>
  </>;
}
