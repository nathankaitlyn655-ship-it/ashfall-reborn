import { NextResponse } from "next/server";
// Stats ingestion moved to the Supabase Edge Function (player-stats).
export async function POST() {
  return NextResponse.json({ error: "Use the Supabase player-stats Edge Function" }, { status: 410 });
}
