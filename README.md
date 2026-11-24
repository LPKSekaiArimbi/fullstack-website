# LPK Sekai Arimbi

Aplikasi pendaftaran siswa berbasis Next.js App Router, TypeScript, Tailwind CSS, komponen shadcn/ui, dan PostgreSQL. Target hosting adalah Vercel (runtime Node.js).

| Halaman | URL | Fungsi |
| --- | --- | --- |
| Beranda | / | Profil lembaga, program, dan tombol pendaftaran |
| Pendaftaran | /pendaftaran | Nama lengkap, WhatsApp, domisili, dan bukti pendaftaran |
| Login admin | /admin/login | Akses untuk satu akun pengelola |
| Dashboard | /admin/dashboard | Ringkasan, pencarian, halaman daftar, dan perubahan status |

## Menjalankan secara lokal

Gunakan Node.js 24 LTS dan PostgreSQL. Dari direktori yang berisi package.json:

1. Jalankan `npm ci`.
2. Salin `.env.example` menjadi `.env.local`.
3. Isi `DATABASE_URL` dengan URI PostgreSQL milik proyek, `ADMIN_EMAIL` dengan email pengelola, dan `ADMIN_PASSWORD_HASH` dengan hasil perintah di bawah.
4. Jalankan `npm run db:init` untuk membuat tabel. Akun database perlu izin membuat tabel dan indeks.
5. Jalankan `npm run dev`, lalu buka http://localhost:3000.

### Membuat hash kata sandi admin

Gunakan kata sandi 12–512 karakter. Perintah berikut bisa dijalankan di Bash atau Git Bash. Masukan disembunyikan dari layar.

```bash
read -rs -p "Kata sandi admin: " admin_pass
printf '\n'
printf '%s' "$admin_pass" | node scripts/admin-hash.mjs
unset admin_pass
```

Salin hasil berupa pasangan salt dan hash ke ADMIN_PASSWORD_HASH. Situs menyimpan sesi admin di database dengan masa berlaku delapan jam. Untuk mencabut semua sesi saat mengganti kata sandi, jalankan `DELETE FROM admin_sessions;` di database proyek.

## Deployment Vercel

1. Siapkan PostgreSQL produksi, misalnya Neon melalui Vercel Marketplace. Gunakan connection string *pooled* dengan TLS sesuai penyedia.
2. Impor repositori aplikasi ke Vercel dan pilih direktori yang berisi package.json sebagai Root Directory. Framework preset adalah Next.js. Pilih Node.js 24.x.
3. Isi tiga environment variable di atas untuk Production. Jika memakai Preview, gunakan database dan kredensial terpisah.
4. Jalankan `npm run db:init` dengan DATABASE_URL database tujuan sebelum menerima pendaftaran. Script dapat dijalankan ulang.
5. Deploy dan uji /pendaftaran serta /admin/login. Untuk menguji build lokal, gunakan `npm run build` lalu `npm start`.

## Data situs sebelumnya

Versi Sites sebelumnya memakai D1. Versi ini menyimpan data dalam PostgreSQL. Database produksi baru mulai kosong. Jika ada data lama, pindahkan kolom id, full_name, whatsapp, domicile, dan created_at ke tabel registrations sebelum mengalihkan tautan pendaftaran. Pertahankan UUID asli agar nomor bukti lama tetap sesuai. Saat migrasi, baca waktu D1 sebagai UTC. Status awal di PostgreSQL adalah Baru.

## Struktur

- app/ memuat halaman dan server actions untuk registrasi, autentikasi, dan perubahan status.
- components/ui/ memuat Button dan Input shadcn/ui. Konfigurasi komponen ada di components.json.
- lib/ memuat koneksi database dan pemeriksaan sesi.
- scripts/ memuat inisialisasi PostgreSQL dan pembuatan hash kata sandi.
- public/ memuat logo lembaga dan foto Gunung Fuji dari landing page sebelumnya.
