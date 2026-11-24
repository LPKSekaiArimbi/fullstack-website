import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
const cookieName = "sekai_admin";
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function isAdmin() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  return (
    (
      await sql()`SELECT 1 FROM admin_sessions WHERE digest=${digest(token)} AND expires_at>now()`
    ).length === 1
  );
}
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
export async function startSession() {
  const token = randomBytes(32).toString("hex");
  await sql()`DELETE FROM admin_sessions WHERE expires_at<=now()`;
  await sql()`INSERT INTO admin_sessions VALUES(${digest(token)},now()+interval '8 hours')`;
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 28800,
  });
}
export async function endSession() {
  const jar = await cookies(),
    token = jar.get(cookieName)?.value;
  if (token)
    await sql()`DELETE FROM admin_sessions WHERE digest=${digest(token)}`;
  jar.delete(cookieName);
}
