import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { verify } from "@node-rs/argon2";
import { and, count, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { admins, loginAttempts, sessions } from "@/db/schema";

export const COOKIE = "admin_session";
const TTL = 7 * 864e5,
  MAX_FAILS = 5,
  WINDOW = 15 * 60_000;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function login(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  const h = await headers();
  const key = `${h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"}|${email.toLowerCase()}`;
  const since = new Date(Date.now() - WINDOW);
  const [{ c }] = await db
    .select({ c: count() })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.key, key), gt(loginAttempts.createdAt, since)));
  if (c >= MAX_FAILS)
    return { error: "Too many attempts. Try again in 15 minutes." };

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email.toLowerCase()))
    .limit(1);
  if (
    !admin ||
    !(await verify(admin.passwordHash, password).catch(() => false))
  ) {
    await db.insert(loginAttempts).values({ key });
    return { error: "Invalid email or password." };
  }
  const token = randomBytes(32).toString("base64url"),
    expiresAt = new Date(Date.now() + TTL);
  await db.insert(sessions).values({
    adminId: admin.id,
    tokenHash: sha(token),
    expiresAt,
    userAgent: h.get("user-agent")?.slice(0, 200),
  });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return {};
}

export async function logout() {
  const jar = await cookies(),
    t = jar.get(COOKIE)?.value;
  if (t) await db.delete(sessions).where(eq(sessions.tokenHash, sha(t)));
  jar.delete(COOKIE);
}

export const getAdmin = cache(async () => {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  const [row] = await db
    .select({ id: admins.id, email: admins.email, name: admins.name })
    .from(sessions)
    .innerJoin(admins, eq(admins.id, sessions.adminId))
    .where(
      and(eq(sessions.tokenHash, sha(t)), gt(sessions.expiresAt, new Date())),
    )
    .limit(1);
  return row ?? null;
});

export async function requireAdmin() {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}
