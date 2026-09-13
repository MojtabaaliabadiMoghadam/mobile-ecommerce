import { db } from "@/db";
import { loyaltyTransactions, users } from "@/db/schema";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await ensureSeeded();
  const { name, email, phone, password } = await req.json().catch(() => ({}));
  if (!name || !email || !password) return NextResponse.json({ error: "نام، ایمیل و رمز عبور الزامی است" }, { status: 400 });
  if (String(password).length < 8) return NextResponse.json({ error: "رمز عبور باید حداقل ۸ کاراکتر باشد" }, { status: 400 });
  const em = String(email).toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return NextResponse.json({ error: "ایمیل معتبر نیست" }, { status: 400 });
  const [ex] = await db.select({ id: users.id }).from(users).where(eq(users.email, em));
  if (ex) return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است" }, { status: 409 });
  const [u] = await db.insert(users).values({ name: String(name).trim(), email: em, phone: phone ? String(phone) : null, passwordHash: hashPassword(password), loyaltyPoints: 100 }).returning();
  await db.insert(loyaltyTransactions).values({ userId: u.id, points: 100, reason: "هدیه عضویت در باشگاه مشتریان" });
  await setSessionCookie(u.id);
  return NextResponse.json({ ok: true, user: { id: u.id, name: u.name, role: u.role } });
}
