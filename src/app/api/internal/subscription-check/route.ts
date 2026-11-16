import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { adminDb } from "@/lib/steamLinkServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function equalSecrets(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}

export async function GET(req: NextRequest) {
  const secret = process.env.ASHFALL_RUST_API_SECRET;
  const supplied = req.headers.get("x-ashfall-server-key") || "";
  if (!secret || secret.length < 32 || !equalSecrets(secret, supplied))
    return NextResponse.json({ active: false }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const steamId = req.nextUrl.searchParams.get("steam_id") || "";
  const kitId = req.nextUrl.searchParams.get("kit_id") || "";
  if (!/^7656119[0-9]{10}$/.test(steamId) || !["airdrop", "vip1", "vip2", "vip3", "vipbuilder"].includes(kitId))
    return NextResponse.json({ active: false }, { status: 400, headers: { "Cache-Control": "no-store" } });

  try {
    const db = adminDb();
    const now = new Date().toISOString();
    const { data, error } = await db.from("ashfall_subscriptions")
      .select("id")
      .eq("steam_id", steamId)
      .eq("kit_id", kitId)
      .eq("status", "active")
      .lte("starts_at", now)
      .gt("expires_at", now)
      .limit(1);
    if (error) throw error;
    return NextResponse.json({ active: !!data?.length }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Subscription verification failed", err);
    return NextResponse.json({ active: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
