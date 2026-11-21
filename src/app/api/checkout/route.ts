import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/steamLinkServer";
import { stripeKits, isStoreKitId } from "@/lib/stripeKits";
import { SHOP_ENABLED } from "@/lib/siteFeatures";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
export async function POST(req: NextRequest) {
  if (!SHOP_ENABLED) {
    return NextResponse.json(
      { error: "The ASHFALL REBORN shop and kits are currently unavailable." },
      { status: 503, headers: noStore }
    );
  }
  try {
    const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401, headers: noStore });
    const db = adminDb();
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Login expired. Please sign in again." }, { status: 401, headers: noStore });
    const { data: link, error: linkError } = await db.from("ashfall_steam_links").select("steam_id,verified_at").eq("user_id", user.id).maybeSingle();
    if (linkError) throw linkError;
    if (!link?.verified_at || !/^7656119[0-9]{10}$/.test(link.steam_id)) return NextResponse.json({ error: "Verify your Steam account on your profile first." }, { status: 403, headers: noStore });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || !("acceptedPolicy" in body) || (body as {acceptedPolicy?: unknown}).acceptedPolicy !== true)
      return NextResponse.json({ error: "Please accept the Purchase & Refund Policy before checkout." }, { status: 400, headers: noStore });
    const ids = (body && typeof body === "object" && "kitIds" in body) ? (body as {kitIds: unknown}).kitIds : null;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 10 || !ids.every((id) => typeof id === "string" && isStoreKitId(id)))
      return NextResponse.json({ error: "Invalid cart (1-10 kits)." }, { status: 400, headers: noStore });
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) throw new Error("Missing STRIPE_SECRET_KEY");
    const stripe = new Stripe(secret);
    // Live payments use the exact Stripe Catalog Price IDs. Test mode retains
    // the existing inline test prices, so the previously tested flow stays intact.
    const livePrices: Record<keyof typeof stripeKits, string> = {
      airdrop: "price_1UcYowKNSv1Zmi7BDUXn7ed5",
      vip1: "price_1UcYpbKNSv1Zmi7BiTF8KyY5",
      vip2: "price_1UcYpxKNSv1Zmi7BdbSsZQlg",
      vip3: "price_1UcYqGKNSv1Zmi7BEkTfxE",
      builder: "price_1UcYqXKNSv1Zmi7BgS9DkJzJ",
    };
    const live = secret.startsWith("sk_live_");
    if (!live && !secret.startsWith("sk_test_"))
      throw new Error("Unexpected Stripe secret key mode");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: ids.map((id: keyof typeof stripeKits) => live
        ? { price: livePrices[id], quantity: 1 }
        : { price_data: { currency: "usd", unit_amount: stripeKits[id].cents, product_data: { name: stripeKits[id].name } }, quantity: 1 }),
      client_reference_id: user.id,
      customer_email: user.email || undefined,
      metadata: { user_id: user.id, steam_id: link.steam_id, kits: JSON.stringify(ids), policy_acknowledged: "true", policy_version: "2026-11-16" },
      success_url: "https://ashfallreborn.com/store/checkout-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://ashfallreborn.com/store?checkout=cancelled",
      expires_at: Math.floor(Date.now() / 1000) + 1800,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return NextResponse.json({ url: session.url }, { headers: noStore });
  } catch (err) {
    console.error("Checkout creation failed", err);
    return NextResponse.json({ error: "Checkout is unavailable. Please contact support." }, { status: 503, headers: noStore });
  }
}

