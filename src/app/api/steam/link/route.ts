import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { adminDb, sign, site } from "@/lib/steamLinkServer";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const db = adminDb();
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Invalid login" }, { status: 401 });
    const nonce = randomBytes(24).toString("hex");
    const payload = Buffer.from(JSON.stringify({ uid: user.id, nonce, exp: Date.now() + 300000 })).toString("base64url");
    const signed = `${payload}.${sign(payload)}`;
    const callback = `${site}/api/steam/callback`;
    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": `${callback}?state=${nonce}`,
      "openid.realm": site,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
    });
    const response = NextResponse.json({ url: `https://steamcommunity.com/openid/login?${params}` });
    response.cookies.set("ashfall_steam_link", signed, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/steam", maxAge: 300 });
    return response;
  } catch {
    return NextResponse.json({ error: "Steam linking unavailable" }, { status: 500 });
  }
}
