import { db } from "@/db";
import { users } from "@/db/schema";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await ensureSeeded();
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "ایمیل و رمز عبور الزامی است" }, { status: 400 });
  const [u] = await db.select().from(users).where(eq(users.email, String(email).toLowerCase().trim()));
  if (!u || !verifyPassword(password, u.passwordHash)) return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است" }, { status: 401 });
  if (!u.isActive) return NextResponse.json({ error: "حساب کاربری شما غیرفعال شده است" }, { status: 403 });
  await setSessionCookie(u.id);
  return NextResponse.json({ ok: true, user: { id: u.id, name: u.name, role: u.role } });
}
