import Link from "next/link";
import { Brand } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { logout, updateStatus } from "@/app/actions";
export const metadata = { title: "Dashboard admin", robots: { index: false } };
const states = ["Baru", "Dihubungi", "Diterima"];
const date = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
type Row = {
  id: string;
  full_name: string;
  whatsapp: string;
  domicile: string;
  status: string;
  created_at: Date;
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; p?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
  const db = sql();
  const match = q
    ? db`WHERE strpos(lower(full_name),lower(${q}))>0 OR strpos(whatsapp,${q})>0 OR strpos(lower(domicile),lower(${q}))>0 OR strpos(lower('SA-'||id::text),lower(${q}))>0`
    : db``;
  const [summary] =
    await db`SELECT count(*)::int AS total,count(*) FILTER(WHERE status='Baru')::int AS baru,count(*) FILTER(WHERE status='Dihubungi')::int AS dihubungi,count(*) FILTER(WHERE status='Diterima')::int AS diterima FROM registrations`;
  const [count] =
    await db`SELECT count(*)::int AS total FROM registrations ${match}`;
  const pages = Math.max(1, Math.ceil(count.total / 20)),
    page = Math.max(1, Math.min(pages, parseInt(params.p ?? "1", 10) || 1));
  const rows = await db<
    Row[]
  >`SELECT * FROM registrations ${match} ORDER BY created_at DESC,id DESC LIMIT 20 OFFSET ${(page - 1) * 20}`;
  const href = (p: number) =>
    "/admin/dashboard?" + new URLSearchParams({ q, p: String(p) });
  return (
    <>
      <header className="adminbar">
        <div className="bar">
          <Brand />
          <form action={logout}>
            <Button variant="outline">Keluar</Button>
          </form>
        </div>
      </header>
      <main className="shell">
        <div className="board">
          <p className="label">
            <i />
            DASHBOARD ADMIN
          </p>
          <h1>Pendaftaran siswa</h1>
          <div className="my-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Semua pendaftar", summary.total],
              ["Baru", summary.baru],
              ["Dihubungi", summary.dihubungi],
              ["Diterima", summary.diterima],
            ].map(([label, n]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <p className="text-sm text-slate-600">{label}</p>
                <strong className="text-3xl">{n}</strong>
              </div>
            ))}
          </div>
          <section className="rounded-xl border border-slate-200 bg-white">
            <form
              action="/admin/dashboard"
              className="flex flex-wrap items-end gap-2 p-4"
            >
              <label className="min-w-48 flex-1 text-sm font-semibold">
                Cari pendaftar
                <Input
                  name="q"
                  defaultValue={q}
                  maxLength={120}
                  placeholder="Nama, nomor, atau domisili"
                  className="mt-1"
                />
              </label>
              <Button>Cari</Button>
              {q && (
                <Button variant="outline" asChild>
                  <Link href="/admin/dashboard">Reset</Link>
                </Button>
              )}
            </form>
            {rows.length ? (
              <div className="overflow-x-auto">
                <table>
                  <caption className="sr-only">Daftar pendaftar</caption>
                  <thead>
                    <tr>
                      {[
                        "Nama dan nomor pendaftaran",
                        "WhatsApp",
                        "Domisili",
                        "Tanggal",
                        "Status",
                      ].map((t) => (
                        <th key={t} scope="col">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <b>{r.full_name}</b>
                          <div className="mt-1 text-xs text-slate-600">
                            SA-{r.id.toUpperCase()}
                          </div>
                        </td>
                        <td>{r.whatsapp}</td>
                        <td>{r.domicile}</td>
                        <td>{date.format(r.created_at)}</td>
                        <td>
                          <form
                            action={updateStatus}
                            className="flex items-center gap-2"
                          >
                            <input type="hidden" name="id" value={r.id} />
                            <select
                              name="status"
                              aria-label={"Status " + r.full_name}
                              defaultValue={r.status}
                            >
                              {states.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                            <button className="cursor-pointer text-sm font-semibold underline">
                              Simpan
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-6 text-slate-600">
                {q
                  ? "Tidak ada pendaftar yang cocok."
                  : "Belum ada pendaftaran siswa."}
              </p>
            )}
            <div className="flex items-center justify-between gap-3 p-4 text-sm">
              <span>
                {count.total} pendaftar · Halaman {page} dari {pages}
              </span>
              <div className="flex gap-3">
                {page > 1 && <Link href={href(page - 1)}>Sebelumnya</Link>}
                {page < pages && <Link href={href(page + 1)}>Berikutnya</Link>}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
