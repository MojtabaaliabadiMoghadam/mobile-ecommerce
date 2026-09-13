import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "content") && !hasPermission(user, "products")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const saved: typeof media.$inferSelect[] = [];
  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      continue;
    }
    if (file.size > MAX_SIZE) {
      continue;
    }
    const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1] || "jpg";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, name), buffer);

    const [row] = await db
      .insert(media)
      .values({
        filename: name,
        originalName: file.name || name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${name}`,
        alt: form.get("alt") ? String(form.get("alt")) : null,
        uploadedBy: user?.id ?? null,
      })
      .returning();
    saved.push(row);
  }

  revalidatePath("/admin/media");
  return NextResponse.json({ ok: true, files: saved });
}
