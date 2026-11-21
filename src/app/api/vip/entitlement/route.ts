import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { adminDb } from "@/lib/steamLinkServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const secret = process.env.ASHFALL_BRIDGE_SECRET ?? "";
  const provided = request.headers.get("x-ashfall-bridge-key") ?? "";
  const left = Buffer.from(secret), right = Buffer.from(provided);
  if (secret.length < 32 || left.length !== right.length || !timingSafeEqual(left, right)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }
  const steamId = request.nextUrl.searchParams.get("steamId") ?? "";
  if (!/^7656119\d{10}$/.test(steamId)) {
    return NextResponse.json({ error: "Invalid Steam ID" }, { status: 400, headers });
  }
  try {
    const { data, error } = await adminDb().from("ashfall_vip_memberships")
      .select("stripe_subscription_id,current_period_end,status")
      .eq("steam_id", steamId)
      .in("status", ["active", "trialing"])
      .gt("current_period_end", new Date().toISOString())
      .limit(1);
    if (error) throw error;
    return NextResponse.json({ entitled: !!data?.length }, { headers });
  } catch (error) {
    console.error("VIP entitlement lookup failed", error);
    return NextResponse.json({ error: "Entitlement lookup unavailable" }, { status: 503, headers });
  }
}
