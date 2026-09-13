import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "content") && !hasPermission(user, "products")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }
  const { id } = await params;
  const [row] = await db.select().from(media).where(eq(media.id, Number(id)));
  if (!row) return NextResponse.json({ error: "فایل یافت نشد" }, { status: 404 });

  // Only delete files that live inside /uploads (never the bundled seed images)
  if (row.url.startsWith("/uploads/")) {
    try {
      await unlink(path.join(process.cwd(), "public", row.url));
    } catch {}
  }
  await db.delete(media).where(eq(media.id, Number(id)));
  revalidatePath("/admin/media");
  return NextResponse.json({ ok: true });
}
