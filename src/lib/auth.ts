import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const SESSION_COOKIE = "cra_session";
const SESSION_DAYS = 30;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Web clients get an httpOnly cookie. Native clients (no shared cookie jar
// with a browser) instead read this same token from the JSON response body
// and send it back as `Authorization: Bearer <token>` on every request.
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { token, userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

async function getBearerToken() {
  const h = await headers();
  const auth = h.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length).trim() || null;
}

export async function destroySession() {
  const bearer = await getBearerToken();
  const jar = await cookies();
  const token = bearer ?? jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const bearer = await getBearerToken();
  const jar = await cookies();
  const token = bearer ?? jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  return user;
}
