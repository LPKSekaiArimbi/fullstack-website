"use client";
import { useActionState } from "react";
import Link from "next/link";
import { register, login, type Result } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegistrationForm({ id }: { id: string }) {
  const [state, submit, busy] = useActionState<Result, FormData>(register, {});
  if (state.number)
    return (
      <div role="status">
        <h1>Pendaftaran diterima</h1>
        <p className="form-lead mt-4">
          Simpan nomor ini sebagai bukti pendaftaranmu.
        </p>
        <p className="receipt-number my-5">{state.number}</p>
        <Button asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    );
  return (
    <>
      <h1>Formulir pendaftaran</h1>
      <p className="form-lead mt-3">
        Isi data berikut untuk mendaftar sebagai calon siswa LPK Sekai Arimbi.
      </p>
      <form action={submit}>
        <input type="hidden" name="id" value={id} />
        <label>
          Nama lengkap
          <Input
            name="name"
            autoComplete="name"
            maxLength={120}
            required
            placeholder="Nama lengkap kamu"
          />
        </label>
        <label>
          Nomor WhatsApp aktif
          <Input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={25}
            required
            placeholder="Contoh: 0812 3456 7890"
          />
        </label>
        <label>
          Kabupaten atau kota domisili
          <Input
            name="city"
            autoComplete="address-level2"
            maxLength={100}
            required
            placeholder="Contoh: Majalengka"
          />
        </label>
        <p className="form-note">
          Data ini digunakan LPK untuk mencatat pendaftaran dan menghubungimu
          terkait pelatihan.
        </p>
        {state.error && <p role="alert">{state.error}</p>}
        <Button disabled={busy}>
          {busy ? "Mengirim…" : "Kirim Pendaftaran"}
        </Button>
      </form>
    </>
  );
}
export function LoginForm() {
  const [state, submit, busy] = useActionState<Result, FormData>(login, {});
  return (
    <>
      <h1>Login admin</h1>
      <p className="form-lead mt-3">
        Masuk untuk melihat dan mengelola pendaftaran siswa.
      </p>
      <form action={submit}>
        <label>
          Email admin
          <Input type="email" name="email" required autoComplete="username" />
        </label>
        <label>
          Kata sandi
          <Input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            maxLength={512}
          />
        </label>
        {state.error && <p role="alert">{state.error}</p>}
        <Button disabled={busy}>{busy ? "Memeriksa…" : "Masuk"}</Button>
      </form>
    </>
  );
}
