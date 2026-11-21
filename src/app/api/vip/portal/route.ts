import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/steamLinkServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401, headers });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "VIP billing is not configured." }, { status: 503, headers });
  try {
    const db = adminDb();
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Not signed in." }, { status: 401, headers });
    const { data, error } = await db.from("ashfall_vip_memberships")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    if (!data?.length) return NextResponse.json({ error: "No VIP subscription found." }, { status: 404, headers });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const portal = await stripe.billingPortal.sessions.create({
      customer: data[0].stripe_customer_id,
      return_url: "https://ashfallreborn.com/store",
    });
    return NextResponse.json({ url: portal.url }, { headers });
  } catch (error) {
    console.error("VIP billing portal failed", error);
    return NextResponse.json({ error: "Unable to open subscription management." }, { status: 503, headers });
  }
}
