import { getCurrentUser } from "@/lib/auth";
import { getUserAddresses } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ addresses: await getUserAddresses(user.id) });
}
