import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

const SECRET = process.env.AUTH_SECRET || "dev-secret-change-me-in-production";
const COOKIE = "mc_session";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");
  return candidate.length === original.length && timingSafeEqual(candidate, original);
}

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}
export function createToken(userId: number): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString(
    "base64url"
  );
  return `${payload}.${sign(payload)}`;
}
export function parseToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.exp < Date.now()) return null;
    return data.uid as number;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: number) {
  const store = await cookies();
  store.set(COOKIE, createToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "customer" | "admin" | "manager" | "support";
  permissions: string[];
  loyaltyPoints: number;
  loyaltyTier: "bronze" | "silver" | "gold";
  personalCoupon: string | null;
  isActive: boolean;
  createdAt: Date;
};

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const uid = parseToken(store.get(COOKIE)?.value);
  if (!uid) return null;
  const [u] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      permissions: users.permissions,
      loyaltyPoints: users.loyaltyPoints,
      loyaltyTier: users.loyaltyTier,
      personalCoupon: users.personalCoupon,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, uid));
  if (!u || !u.isActive) return null;
  return u;
});

export function isStaff(user: SessionUser | null): boolean {
  return !!user && user.role !== "customer";
}
export function hasPermission(user: SessionUser | null, perm: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.role !== "customer" && user.permissions.includes(perm);
}
