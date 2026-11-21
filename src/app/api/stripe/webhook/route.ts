import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/steamLinkServer";
import { stripeKits, isStoreKitId } from "@/lib/stripeKits";

async function syncVipSubscription(stripe: Stripe, sub: Stripe.Subscription) {
  if (sub.metadata?.package !== "ashfall_vip_monthly") return;
  const userId = sub.metadata.user_id;
  const steamId = sub.metadata.steam_id;
  const price = process.env.ASHFALL_VIP_MONTHLY_PRICE_ID;
  const item = sub.items.data[0];
  if (!price || !userId || !/^[0-9a-f-]{36}$/i.test(userId) ||
      !steamId || !/^7656119\d{10}$/.test(steamId) ||
      sub.items.data.length !== 1 || item?.price.id !== price ||
      item.price.unit_amount !== 799 || item.price.currency !== "usd" ||
      item.price.recurring?.interval !== "month") {
    throw new Error("VIP subscription data does not match ASHFALL's configured monthly plan");
  }
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const { data: link, error: linkError } = await adminDb().from("ashfall_steam_links")
    .select("steam_id").eq("user_id", userId).maybeSingle();
  if (linkError || link?.steam_id !== steamId) throw new Error("VIP Steam verification mismatch; review required");
  const { error } = await adminDb().from("ashfall_vip_memberships").upsert({
    stripe_subscription_id: sub.id,
    user_id: userId,
    steam_id: steamId,
    stripe_customer_id: customerId,
    status: sub.status,
    current_period_end: item.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });
  if (error) throw error;
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !signingSecret) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  let event: Stripe.Event;
  const stripe = new Stripe(key);
  try { event = stripe.webhooks.constructEvent(await req.text(), signature, signingSecret); }
  catch { return NextResponse.json({ error: "Invalid signature" }, { status: 400 }); }

  if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
    try {
      const incoming = event.data.object as Stripe.Subscription;
      // Read the current canonical state; delayed, out-of-order webhook events
      // must not restore a canceled subscription.
      const latest = event.type === "customer.subscription.deleted"
        ? incoming
        : await stripe.subscriptions.retrieve(incoming.id);
      await syncVipSubscription(stripe, latest);
      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("VIP subscription sync failed; Stripe will retry", error);
      return NextResponse.json({ error: "VIP sync pending retry" }, { status: 500 });
    }
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") return NextResponse.json({ received: true });
  try {
    const incoming = event.data.object as Stripe.Checkout.Session;
    // Retrieve canonical payment state and actual purchased line items from Stripe.
    const session = await stripe.checkout.sessions.retrieve(incoming.id, { expand: ["line_items"] });
    if (session.mode === "subscription") {
      if (session.payment_status !== "paid" || !session.subscription) return NextResponse.json({ received: true });
      const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      await syncVipSubscription(stripe, await stripe.subscriptions.retrieve(id));
      return NextResponse.json({ received: true });
    }
    if (session.mode !== "payment" || session.payment_status !== "paid" || session.currency?.toLowerCase() !== "usd") return NextResponse.json({ received: true });
    const ids: unknown = JSON.parse(session.metadata?.kits || "null");
    const userId = session.metadata?.user_id;
    const steamId = session.metadata?.steam_id;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 10 || !ids.every((id) => typeof id === "string" && isStoreKitId(id)) || !userId || !steamId || !/^7656119[0-9]{10}$/.test(steamId) || session.client_reference_id !== userId) throw new Error("Invalid payment metadata");
    const expected = ids.reduce((sum: number, id: keyof typeof stripeKits) => sum + stripeKits[id].cents, 0);
    if (session.amount_total !== expected) throw new Error("Payment amount mismatch");
    const lines = session.line_items?.data || [];
    if (lines.length !== ids.length || lines.some((line, i) => line.amount_total !== stripeKits[ids[i] as keyof typeof stripeKits].cents || line.quantity !== 1)) throw new Error("Line item mismatch");
    const db = adminDb();
    const { data: link, error: linkError } = await db.from("ashfall_steam_links").select("steam_id").eq("user_id", userId).maybeSingle();
    if (linkError || link?.steam_id !== steamId) throw new Error("Steam account link changed; manual review required");
    const { error } = await db.rpc("fulfill_ashfall_stripe_checkout", { p_session_id: session.id, p_steam_id: steamId, p_user_id: userId, p_amount_cents: expected, p_kits: ids });
    if (error) throw error;
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe fulfillment failed; Stripe will retry", err);
    return NextResponse.json({ error: "Fulfillment pending retry" }, { status: 500 });
  }
}
