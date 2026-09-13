import { ensureSeeded, isSeeded } from "@/lib/seed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET() {
  await ensureSeeded();
  return NextResponse.json({ seeded: await isSeeded() });
}
