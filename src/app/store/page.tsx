"use client";

import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";

type Product = { id: string; name: string; price: number; duration: string; cooldown: string; category: "VIP" | "Kits"; icon: string; tag: string; description: string; highlights: string[]; featured?: boolean };

const products: Product[] = [
  { id: "airdrop", name: "Airdrop Subscription", price: 7.99, duration: "14 days", cooldown: "Every 24 hours", category: "Kits", icon: "🪂", tag: "Two-week access", description: "Claim your airdrop kit once every 24 hours throughout your 14-day access period.", highlights: ["14-day access", "24-hour claim cooldown", "No bonus components"] },
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
          <button type="button" onClick={() => {setCart(items => [...items,p.id]);setShowCart(true);}} className="mt-auto rounded-lg bg-orange-600 px-5 py-3 font-bold hover:bg-orange-500">Add to Cart</button>
        </article>)}</div>
        <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center text-sm text-zinc-400">Subscriptions and kit access are planned offerings. Final kit contents, payment processing, and automatic in-game fulfillment must be verified before sales are enabled.</div>
      </section>
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
            <button type="button" disabled className="w-full cursor-not-allowed rounded-lg bg-zinc-700 px-5 py-3 font-bold text-zinc-300">Checkout coming soon</button>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">Payments are not enabled yet. No charge will be made. Checkout and in-game delivery require secure backend testing.</p>
          </div>
        </aside>
      </div>}
    </main>
  </>;
}
