import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/steamLinkServer";
import { VIP_PURCHASES_ENABLED } from "@/lib/siteFeatures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

function configured() {
  return VIP_PURCHASES_ENABLED &&
    /^price_[A-Za-z0-9]+$/.test(process.env.ASHFALL_VIP_MONTHLY_PRICE_ID ?? "") &&
    !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.ASHFALL_BRIDGE_SECRET;
}

export async function GET() {
  return NextResponse.json({ available: configured() }, { headers });
}

export async function POST(request: NextRequest) {
  if (!configured()) {
    return NextResponse.json({ error: "VIP checkout is not open yet." }, { status: 503, headers });
  }
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return NextResponse.json({ error: "Please log in first." }, { status: 401, headers });

  try {
    const body = await request.json();
    if (body?.acceptedTerms !== true) return NextResponse.json({ error: "Please accept VIP recurring billing terms." }, { status: 400, headers });
    const db = adminDb();
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Login expired. Please sign in again." }, { status: 401, headers });
    const { data: link, error: linkError } = await db.from("ashfall_steam_links")
      .select("steam_id,verified_at").eq("user_id", user.id).maybeSingle();
    if (linkError || !link?.verified_at || !/^7656119\d{10}$/.test(link.steam_id)) {
      return NextResponse.json({ error: "Verify your Steam account on your profile before subscribing." }, { status: 403, headers });
    }

    const { data: membership, error: membershipError } = await db.from("ashfall_vip_memberships")
      .select("stripe_subscription_id,status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due", "incomplete"])
      .limit(1);
    if (membershipError) throw membershipError;
    if (membership?.length) return NextResponse.json({ error: "A VIP subscription already exists. Manage it instead of buying another." }, { status: 409, headers });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const priceId = process.env.ASHFALL_VIP_MONTHLY_PRICE_ID!;
    const price = await stripe.prices.retrieve(priceId);
    // No arbitrary price IDs or accidental annual/test-mode subscriptions.
    if (!price.active || price.type !== "recurring" || price.currency !== "usd" ||
        price.unit_amount !== 799 || price.recurring?.interval !== "month" ||
        price.recurring?.interval_count !== 1) {
      throw new Error("VIP Stripe Price must be an active $7.99 USD monthly recurring price");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email || undefined,
      client_reference_id: user.id,
      metadata: { package: "ashfall_vip_monthly", user_id: user.id, steam_id: link.steam_id, terms: "2026-11-21" },
      subscription_data: { metadata: { package: "ashfall_vip_monthly", user_id: user.id, steam_id: link.steam_id } },
      success_url: "https://ashfallreborn.com/store/vip-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://ashfallreborn.com/store?checkout=cancelled",
    });
    if (!session.url) throw new Error("Stripe did not provide a checkout URL");
    return NextResponse.json({ url: session.url }, { headers });
  } catch (error) {
    console.error("VIP checkout failed", error);
    return NextResponse.json({ error: "VIP checkout is temporarily unavailable. Please contact support." }, { status: 503, headers });
  }
}
