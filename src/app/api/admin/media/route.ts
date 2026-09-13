import { NextRequest, NextResponse } from "next/server";
import { getMediaItems } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "content") && !hasPermission(user, "products")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const data = await getMediaItems({ query: q, page });
  return NextResponse.json(data);
}
