"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";

const products = [
  {
    name: "VIP Bronze",
    price: "$4.99",
    category: "VIP",
    tag: "Starter Supporter",
    featured: false,
    icon: "🧱",
    description:
      "Supporter role, Discord recognition, basic VIP perks, and monthly rewards.",
    link: "https://ashfallreborn.tip4serv.com/",
  },
  {
    name: "VIP Silver",
    price: "$9.99",
    category: "VIP",
    tag: "Most Popular",
    featured: true,
    icon: "⚙️",
    description:
      "Includes Bronze perks, extra supporter rewards, priority benefits, and better monthly bonuses.",
    link: "https://ashfallreborn.tip4serv.com/",
  },
  {
    name: "VIP Gold",
    price: "$19.99",
    category: "VIP",
    tag: "Best Value",
    featured: false,
    icon: "📦",
    description:
      "Top supporter tier with premium perks, exclusive recognition, and the strongest supporter benefits.",
    link: "https://ashfallreborn.tip4serv.com/",
  },
  {
    name: "Starter Kit",
    price: "$2.99",
    category: "Kits",
    tag: "Balanced Kit",
    featured: false,
    icon: "🪓",
    description:
      "A fair starter kit designed to help new players get moving without breaking server balance.",
    link: "https://ashfallreborn.tip4serv.com/",
  },
  {
    name: "Builder Kit",
    price: "$4.99",
    category: "Kits",
    tag: "Base Support",
    featured: false,
    icon: "🔨",
    description:
      "Useful building supplies for players focused on getting a base down and surviving wipe day.",
    link: "https://ashfallreborn.tip4serv.com/",
  },
  {
    name: "Cosmetic Pack",
    price: "$3.99",
    category: "Cosmetics",
    tag: "No Pay-To-Win",
    featured: false,
    icon: "🎭",
    description:
      "Support the server with cosmetic rewards and non-game-breaking supporter extras.",
    link: "https://ashfallreborn.tip4serv.com/",
  },
];

const categories = ["All", "VIP", "Kits", "Cosmetics"];

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-10 top-32 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute right-10 top-96 h-96 w-96 rounded-full bg-orange-700/10 blur-3xl" />
          <div className="absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />
        </div>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32">
          <div className="absolute inset-0">
            <img
              src="https://i.imgur.com/OCzWrRI.png"
              alt="Ashfall Reborn Store Background"
              className="h-full w-full scale-105 object-cover"
            />
            <div className="absolute inset-0 bg-black/75" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/40 to-zinc-950" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl text-center fade-up">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              Official Ashfall Reborn Store
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase md:text-7xl">
              Support The Server
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-300">
              Upgrade your experience with VIP packages, balanced kits,
              cosmetics, and supporter perks while helping Ashfall Reborn grow.
            </p>

            <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-orange-500/40 bg-orange-500/10 p-8 shadow-2xl shadow-orange-500/20 backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
                Featured Package
              </p>

              <h2 className="mt-3 text-4xl font-black uppercase">
                VIP Silver
              </h2>

              <p className="mt-4 text-zinc-300">
                Our most popular supporter tier with balanced perks, Discord
                recognition, and extra monthly rewards.
              </p>

              <a
                href="https://ashfallreborn.tip4serv.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-lg bg-orange-600 px-6 py-3 font-bold transition duration-300 hover:scale-105 hover:bg-orange-700"
              >
                View VIP Silver
              </a>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-32 text-center fade-up">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
            Store Packages
          </p>

          <h2 className="mt-4 text-5xl font-black uppercase md:text-6xl">
            Choose Your Package
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Browse VIP ranks, kits, cosmetics, and supporter options designed to
            keep gameplay fair and balanced.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-lg px-5 py-3 text-sm font-bold uppercase transition ${
                  activeCategory === category
                    ? "bg-orange-600 text-white"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-orange-500 hover:text-orange-500"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.name}
                className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] ${
                  product.featured
                    ? "scale-105 border-2 border-orange-500 bg-orange-500/10 shadow-2xl shadow-orange-500/20 backdrop-blur"
                    : "border border-zinc-800 bg-zinc-900/90 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10"
                }`}
              >
                <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -left-20 top-0 h-full w-32 rotate-12 bg-white/10 blur-2xl" />
                </div>

                <div className="flex justify-center">
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-zinc-950 text-6xl transition duration-300 group-hover:scale-110">
                    {product.icon}
                  </div>
                </div>

                <p className="mt-6 text-sm font-bold uppercase tracking-widest text-orange-500">
                  {product.tag}
                </p>

                <h3 className="mt-3 text-3xl font-black uppercase">
                  {product.name}
                </h3>

                <p className="mt-3 text-4xl font-black text-orange-500">
                  {product.price}
                </p>

                <p className="mt-4 min-h-24 text-zinc-400">
                  {product.description}
                </p>

                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-6 inline-block w-full rounded-lg px-5 py-3 text-center font-bold transition ${
                    product.featured
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  Buy Now
                </a>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-8 backdrop-blur">
            <h2 className="text-3xl font-black uppercase">
              No Pay-To-Win Promise
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-zinc-400">
              Store purchases help pay for hosting, plugins, development,
              events, and future improvements. Ashfall Reborn is built around
              fair PvP, balanced progression, and competitive gameplay.
            </p>

            <a
              href="https://ashfallreborn.tip4serv.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-lg bg-orange-600 px-6 py-3 font-bold transition hover:bg-orange-700"
            >
              Open Full Store
            </a>
          </div>
        </section>
      </main>
    </>
  );
}