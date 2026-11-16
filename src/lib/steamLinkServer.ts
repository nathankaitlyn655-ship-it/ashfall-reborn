import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";

export const site = "https://ashfallreborn.com";
export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing server Supabase environment variables");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function sign(payload: string) {
  const key = process.env.STEAM_LINK_SECRET;
  if (!key || key.length < 32) throw new Error("STEAM_LINK_SECRET must be at least 32 characters");
  return createHmac("sha256", key).update(payload).digest("hex");
}
export function verifySigned(value: string): string | null {
  const split = value.lastIndexOf(".");
  if (split < 0) return null;
  const payload = value.slice(0, split);
  const supplied = value.slice(split + 1);
  if (!/^[a-f0-9]{64}$/.test(supplied)) return null;
  const a = Buffer.from(sign(payload), "hex"), b = Buffer.from(supplied, "hex");
  return timingSafeEqual(a, b) ? payload : null;
}
