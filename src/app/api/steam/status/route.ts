import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/steamLinkServer";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const db = adminDb();
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Invalid login" }, { status: 401 });
    const { data, error: queryError } = await db.from("ashfall_steam_links").select("steam_id,verified_at").eq("user_id", user.id).maybeSingle();
    if (queryError) return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    return NextResponse.json({ steamId: data?.steam_id || null, verifiedAt: data?.verified_at || null }, { headers: { "cache-control": "no-store" } });
  } catch { return NextResponse.json({ error: "Unavailable" }, { status: 500 }); }
}
