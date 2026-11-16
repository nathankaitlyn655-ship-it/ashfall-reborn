import { NextRequest, NextResponse } from "next/server";
import { adminDb, site, verifySigned } from "@/lib/steamLinkServer";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const redirect = (status: string) => {
    const response = NextResponse.redirect(`${site}/profile?steam=${status}`);
    response.cookies.set("ashfall_steam_link", "", { path: "/api/steam", maxAge: 0 });
    return response;
  };
  try {
    const signed = req.cookies.get("ashfall_steam_link")?.value || "";
    const payload = verifySigned(signed);
    if (!payload) return redirect("invalid");
    const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!state.uid || !state.nonce || state.exp < Date.now() || req.nextUrl.searchParams.get("state") !== state.nonce) return redirect("invalid");
    const incoming = req.nextUrl.searchParams;
    const returnTo = incoming.get("openid.return_to");
    if (returnTo !== `${site}/api/steam/callback?state=${state.nonce}`) return redirect("invalid");
    if (incoming.get("openid.ns") !== "http://specs.openid.net/auth/2.0" || incoming.get("openid.mode") !== "id_res") return redirect("invalid");
    const claimed = incoming.get("openid.claimed_id") || "";
    const identity = incoming.get("openid.identity") || "";
    const match = claimed.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(7656119\d{10})$/);
    if (!match || identity !== claimed) return redirect("invalid");
    const form = new URLSearchParams();
    incoming.forEach((value, key) => { if (key.startsWith("openid.")) form.append(key, value); });
    form.set("openid.mode", "check_authentication");
    const verified = await fetch("https://steamcommunity.com/openid/login", { method: "POST", body: form, headers: { "content-type": "application/x-www-form-urlencoded" }, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!verified.ok || !/^is_valid:true\s*$/m.test(await verified.text())) return redirect("invalid");
    const db = adminDb();
    const { error } = await db.from("ashfall_steam_links").upsert({ user_id: state.uid, steam_id: match[1], verified_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) return redirect("conflict");
    return redirect("linked");
  } catch { return redirect("error"); }
}
