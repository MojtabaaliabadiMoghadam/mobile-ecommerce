import { searchProducts } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const items = await searchProducts(q, 6);
  return NextResponse.json({ items });
}
