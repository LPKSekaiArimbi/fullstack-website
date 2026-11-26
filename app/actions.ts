"use server";
import { randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdmin, startSession, endSession } from "@/lib/auth";
import {
  registrationDocuments,
  type RegistrationDocumentKey,
} from "@/lib/registration";
import { getTodayInJakarta, parseIndonesianDate } from "@/lib/indonesian-date";
const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const uuid =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export type Result = {
  error?: string;
  fieldErrors?: Record<string, string>;
  number?: string;
};
class RegistrationConflictError extends Error {}

export async function register(_: Result, form: FormData): Promise<Result> {
  const name = text(form, "name"),
    nik = text(form, "nik"),
    kkNumber = text(form, "kk_number"),
    birthPlace = text(form, "birth_place"),
    birthDateInput = text(form, "birth_date"),
    birthDate = parseIndonesianDate(birthDateInput) ?? "",
    gender = text(form, "gender"),
    religion = text(form, "religion"),
    maritalStatus = text(form, "marital_status"),
    ktpAddress = text(form, "ktp_address"),
    domicileAddress = text(form, "domicile_address"),
    phone = text(form, "phone").replace(/[\s()-]/g, ""),
    email = text(form, "email").toLowerCase(),
    educationLevel = text(form, "education_level"),
    schoolName = text(form, "school_name"),
    major = text(form, "major"),
    graduationYearText = text(form, "graduation_year"),
    graduationYear = Number(graduationYearText),
    heightText = text(form, "height_cm"),
    heightCm = Number(heightText),
    weightText = text(form, "weight_kg"),
    weightKg = Number(weightText),
    bloodType = text(form, "blood_type"),
    eyeMinus = text(form, "eye_minus"),
    id = text(form, "id");
  const currentYear = new Date().getFullYear();
  if (!uuid.test(id)) return { error: "Formulir pendaftaran tidak valid." };

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Nama lengkap wajib diisi.";
  else if (name.length > 120)
    fieldErrors.name = "Nama lengkap maksimal 120 karakter.";
  if (!/^\d{16}$/.test(nik))
    fieldErrors.nik = "NIK harus terdiri dari 16 digit angka.";
  if (!/^\d{16}$/.test(kkNumber))
    fieldErrors.kk_number = "Nomor KK harus terdiri dari 16 digit angka.";
  if (!birthPlace) fieldErrors.birth_place = "Tempat lahir wajib diisi.";
  else if (birthPlace.length > 100)
    fieldErrors.birth_place = "Tempat lahir maksimal 100 karakter.";
  if (!birthDate)
    fieldErrors.birth_date = birthDateInput
      ? "Masukkan tanggal lahir yang valid dengan format dd/mm/yyyy."
      : "Tanggal lahir wajib diisi.";
  else if (birthDate > getTodayInJakarta())
    fieldErrors.birth_date = "Tanggal lahir tidak boleh melebihi hari ini.";
  if (!["Laki-laki", "Perempuan"].includes(gender))
    fieldErrors.gender = "Pilih jenis kelamin.";
  if (
    ![
      "Islam",
      "Kristen Protestan",
      "Katolik",
      "Hindu",
      "Buddha",
      "Konghucu",
      "Lainnya",
    ].includes(religion)
  )
    fieldErrors.religion = "Pilih agama.";
  if (!["Belum menikah", "Menikah", "Cerai hidup", "Cerai mati"].includes(
    maritalStatus,
  ))
    fieldErrors.marital_status = "Pilih status pernikahan.";
  if (!ktpAddress) fieldErrors.ktp_address = "Alamat sesuai KTP wajib diisi.";
  else if (ktpAddress.length > 500)
    fieldErrors.ktp_address = "Alamat maksimal 500 karakter.";
  if (domicileAddress.length > 500)
    fieldErrors.domicile_address = "Alamat maksimal 500 karakter.";
  if (!phone) fieldErrors.phone = "Nomor WhatsApp wajib diisi.";
  else if (!/^\+?\d{8,15}$/.test(phone))
    fieldErrors.phone = "Masukkan nomor WhatsApp yang terdiri dari 8–15 digit.";
  if (!email) fieldErrors.email = "Email wajib diisi.";
  else if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    fieldErrors.email = "Masukkan alamat email yang valid.";
  if (!["SMP", "SMA", "SMK", "D3", "D4", "S1"].includes(educationLevel))
    fieldErrors.education_level = "Pilih pendidikan terakhir.";
  if (!schoolName) fieldErrors.school_name = "Asal institusi wajib diisi.";
  else if (schoolName.length > 150)
    fieldErrors.school_name = "Nama institusi maksimal 150 karakter.";
  if (!major) fieldErrors.major = "Jurusan wajib diisi.";
  else if (major.length > 120)
    fieldErrors.major = "Jurusan maksimal 120 karakter.";
  if (!graduationYearText)
    fieldErrors.graduation_year = "Tahun kelulusan wajib diisi.";
  else if (
    !Number.isInteger(graduationYear) ||
    graduationYear < 1950 ||
    graduationYear > currentYear
  )
    fieldErrors.graduation_year = `Tahun kelulusan harus antara 1950 dan ${currentYear}.`;
  if (!heightText) fieldErrors.height_cm = "Tinggi badan wajib diisi.";
  else if (!Number.isInteger(heightCm) || heightCm < 100 || heightCm > 230)
    fieldErrors.height_cm = "Tinggi badan harus antara 100 dan 230 cm.";
  if (!weightText) fieldErrors.weight_kg = "Berat badan wajib diisi.";
  else if (!Number.isInteger(weightKg) || weightKg < 20 || weightKg > 250)
    fieldErrors.weight_kg = "Berat badan harus antara 20 dan 250 kg.";
  if (!["A", "B", "AB", "O", "Belum tahu"].includes(bloodType))
    fieldErrors.blood_type = "Pilih golongan darah.";
  if (!eyeMinus) fieldErrors.eye_minus = "Data mata minus wajib diisi.";
  else if (eyeMinus.length > 100)
    fieldErrors.eye_minus = "Data mata minus maksimal 100 karakter.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const uploaded: {
    id: string;
    key: RegistrationDocumentKey;
    name: string;
    contentType: string;
    data: Buffer;
  }[] = [];
  let totalFileSize = 0;
  for (const document of registrationDocuments) {
    const values = form
      .getAll(`document_${document.key}`)
      .filter((value): value is File => value instanceof File && value.size > 0);
    if (!values.length)
      return {
        fieldErrors: {
          [`document_${document.key}`]: `Berkas ${document.label} wajib diunggah.`,
        },
      };
    if (!document.multiple && values.length > 1)
      return {
        fieldErrors: {
          [`document_${document.key}`]: `Unggah satu berkas untuk ${document.label}.`,
        },
      };

    for (const value of values) {
      if (value.size > 1_000_000)
        return {
          fieldErrors: {
            [`document_${document.key}`]: `Berkas ${document.label} melebihi batas 1 MB.`,
          },
        };
      totalFileSize += value.size;
      if (totalFileSize > 3_500_000)
        return {
          fieldErrors: {
            [`document_${document.key}`]:
              "Ukuran total semua berkas tidak boleh lebih dari 3,5 MB.",
          },
        };

      const data = Buffer.from(await value.arrayBuffer());
      const isPdf = data.subarray(0, 5).toString() === "%PDF-";
      if (!isPdf)
        return {
          fieldErrors: {
            [`document_${document.key}`]: `Berkas ${document.label} harus berupa PDF yang valid.`,
          },
        };

      uploaded.push({
        id: randomUUID(),
        key: document.key,
        name:
          value.name
            .split(/[\\/]/)
            .pop()
            ?.replace(/[^\w.-]/g, "_")
            .slice(0, 120) || document.label,
        contentType: "application/pdf",
        data,
      });
    }
  }

  try {
    const db = sql();
    await db.begin(async (tx) => {
      const saved = await tx`
        INSERT INTO registrations(
          id,full_name,whatsapp,domicile,nik,kk_number,birth_place,birth_date,
          gender,religion,marital_status,ktp_address,domicile_address,email,
          education_level,school_name,major,graduation_year,height_cm,weight_kg,
          blood_type,eye_minus
        ) VALUES(
          ${id},${name},${phone},${domicileAddress || ktpAddress},${nik},
          ${kkNumber},${birthPlace},${birthDate},${gender},${religion},
          ${maritalStatus},${ktpAddress},${domicileAddress || null},${email},
          ${educationLevel},${schoolName},${major},${graduationYear},${heightCm},
          ${weightKg},${bloodType},${eyeMinus}
        ) ON CONFLICT(id) DO NOTHING RETURNING id
      `;
      if (!saved.length) {
        const [existing] = await tx`
          SELECT 1 FROM registrations WHERE id=${id} AND full_name=${name}
            AND whatsapp=${phone} AND nik=${nik} AND kk_number=${kkNumber}
        `;
        const [documentCount] = await tx`
          SELECT count(*)::int AS total FROM registration_documents
          WHERE registration_id=${id}
        `;
        if (!existing || documentCount.total !== uploaded.length)
          throw new RegistrationConflictError();
        return;
      }

      for (const document of uploaded) {
        await tx`
          INSERT INTO registration_documents(
            document_id,registration_id,document_type,file_name,content_type,
            file_size,file_data
          ) VALUES(
            ${document.id},${id},${document.key},${document.name},
            ${document.contentType},${document.data.length},${document.data}
          )
        `;
      }
    });
  } catch (error) {
    if (error instanceof RegistrationConflictError)
      return {
        error:
          "Formulir ini sudah digunakan. Buka formulir baru untuk pendaftaran berikutnya.",
      };
    console.error(
      "Registration save failed:",
      error instanceof Error ? error.name : "UnknownError",
    );
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
    return {
      fieldErrors: {
        email: "Email atau kata sandi salah.",
        password: "Email atau kata sandi salah.",
      },
    };
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
