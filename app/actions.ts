"use server";
import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdmin, startSession, endSession } from "@/lib/auth";
const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const uuid =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export type Result = { error?: string; number?: string };
export async function register(_: Result, form: FormData): Promise<Result> {
  const name = text(form, "name"),
    phone = text(form, "phone").replace(/[\s()-]/g, ""),
    city = text(form, "city"),
    id = text(form, "id");
  if (
    !uuid.test(id) ||
    !name ||
    name.length > 120 ||
    !city ||
    city.length > 100 ||
    !/^\+?\d{8,15}$/.test(phone)
  )
    return {
      error: "Periksa nama, domisili, dan nomor WhatsApp (8–15 digit).",
    };
  try {
    const db = sql();
    const saved =
      await db`INSERT INTO registrations(id,full_name,whatsapp,domicile) VALUES(${id},${name},${phone},${city}) ON CONFLICT(id) DO NOTHING RETURNING id`;
    if (
      !saved.length &&
      !(
        await db`SELECT 1 FROM registrations WHERE id=${id} AND full_name=${name} AND whatsapp=${phone} AND domicile=${city}`
      ).length
    )
      return {
        error:
          "Formulir ini sudah digunakan. Buka formulir baru untuk pendaftaran berikutnya.",
      };
  } catch {
    return { error: "Pendaftaran belum terkonfirmasi. Silakan kirim kembali." };
  }
  return { number: "SA-" + id.toUpperCase() };
}
export async function login(_: Result, form: FormData): Promise<Result> {
  const email = text(form, "email").toLowerCase(),
    password = String(form.get("password") ?? "");
  if (
    !email ||
    email !== process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
    !password ||
    password.length > 512
  )
    return { error: "Email atau kata sandi salah." };
  try {
    const db = sql();
    const [limit] =
      await db`INSERT INTO login_attempts VALUES('admin',now(),1) ON CONFLICT(bucket) DO UPDATE SET starts_at=CASE WHEN login_attempts.starts_at < now()-interval '10 minutes' THEN now() ELSE login_attempts.starts_at END, attempts=CASE WHEN login_attempts.starts_at < now()-interval '10 minutes' THEN 1 ELSE login_attempts.attempts+1 END RETURNING attempts`;
    if (limit.attempts > 10)
      return { error: "Terlalu banyak percobaan. Coba lagi setelah 10 menit." };
    const [salt, hash] = (process.env.ADMIN_PASSWORD_HASH ?? "").split(":");
    if (!/^[0-9a-f]{32}$/.test(salt) || !/^[0-9a-f]{128}$/.test(hash ?? ""))
      throw Error();
    const computed = (await promisify(scrypt)(password, salt, 64)) as Buffer;
    if (!timingSafeEqual(computed, Buffer.from(hash, "hex")))
      return { error: "Email atau kata sandi salah." };
    await startSession();
    await db`DELETE FROM login_attempts WHERE bucket='admin'`;
  } catch {
    return { error: "Login belum tersedia. Periksa konfigurasi server." };
  }
  redirect("/admin/dashboard");
}
export async function logout() {
  await endSession();
  redirect("/admin/login");
}
export async function updateStatus(form: FormData) {
  await requireAdmin();
  const id = text(form, "id"),
    status = text(form, "status");
  if (!uuid.test(id) || !["Baru", "Dihubungi", "Diterima"].includes(status))
    throw Error("Data tidak valid.");
  await sql()`UPDATE registrations SET status=${status} WHERE id=${id}`;
  revalidatePath("/admin/dashboard");
}
