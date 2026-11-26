import Link from "next/link";
import { Brand } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  registrationDocuments,
  type RegistrationDocumentKey,
} from "@/lib/registration";
import { logout, updateStatus } from "@/app/actions";
export const metadata = { title: "Dashboard admin", robots: { index: false } };
const states = ["Baru", "Dihubungi", "Diterima"] as const;
const sortOptions = ["newest", "oldest", "name-asc", "name-desc"] as const;
const date = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
function whatsappHref(phone: string) {
  const number = phone.replace(/\D/g, "").replace(/^0/, "62");
  return `https://wa.me/${number}`;
}
type Row = {
  id: string;
  full_name: string;
  whatsapp: string;
  domicile: string;
  nik: string | null;
  kk_number: string | null;
  birth_place: string | null;
  birth_date: string | Date | null;
  gender: string | null;
  religion: string | null;
  marital_status: string | null;
  ktp_address: string | null;
  domicile_address: string | null;
  email: string | null;
  education_level: string | null;
  school_name: string | null;
  major: string | null;
  graduation_year: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  blood_type: string | null;
  eye_minus: string | null;
  status: string;
  created_at: Date;
};
type DocumentRow = {
  document_id: string;
  registration_id: string;
  document_type: RegistrationDocumentKey;
  file_name: string;
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    p?: string | string[];
    status?: string | string[];
    sort?: string | string[];
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const getParam = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : "";
  const q = getParam(params.q).trim().slice(0, 120);
  const status =
    states.find((value) => value === getParam(params.status)) ?? "";
  const sort =
    sortOptions.find((value) => value === getParam(params.sort)) ?? "newest";
  const db = sql();
  const searchMatch = q
    ? db`(strpos(lower(full_name),lower(${q}))>0 OR strpos(whatsapp,${q})>0 OR strpos(lower(domicile),lower(${q}))>0 OR strpos(lower('SA-'||id::text),lower(${q}))>0)`
    : db`TRUE`;
  const statusMatch = status ? db`status=${status}` : db`TRUE`;
  const match = db`WHERE ${searchMatch} AND ${statusMatch}`;
  const [summary] =
    await db`SELECT count(*)::int AS total,count(*) FILTER(WHERE status='Baru')::int AS baru,count(*) FILTER(WHERE status='Dihubungi')::int AS dihubungi,count(*) FILTER(WHERE status='Diterima')::int AS diterima FROM registrations`;
  const [count] =
    await db`SELECT count(*)::int AS total FROM registrations ${match}`;
  const pages = Math.max(1, Math.ceil(count.total / 20)),
    page = Math.max(
      1,
      Math.min(pages, parseInt(getParam(params.p) || "1", 10) || 1),
    );
  const orderBy =
    sort === "oldest"
      ? db`created_at ASC,id ASC`
      : sort === "name-asc"
        ? db`lower(full_name) ASC,created_at DESC,id DESC`
        : sort === "name-desc"
          ? db`lower(full_name) DESC,created_at DESC,id DESC`
          : db`created_at DESC,id DESC`;
  const rows = await db<
    Row[]
  >`SELECT * FROM registrations ${match} ORDER BY ${orderBy} LIMIT 20 OFFSET ${(page - 1) * 20}`;
  const documents = rows.length
    ? await db<DocumentRow[]>`
      SELECT document_id,registration_id,document_type,file_name
        FROM registration_documents
        WHERE registration_id=ANY(${rows.map((row) => row.id)}::uuid[])
      `
    : [];
  const documentsByRegistration = new Map<string, DocumentRow[]>();
  for (const document of documents) {
    const list = documentsByRegistration.get(document.registration_id) ?? [];
    list.push(document);
    documentsByRegistration.set(document.registration_id, list);
  }
  const href = (nextPage: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (status) query.set("status", status);
    if (sort !== "newest") query.set("sort", sort);
    if (nextPage > 1) query.set("p", String(nextPage));
    const queryString = query.toString();
    return `/admin/dashboard${queryString ? `?${queryString}` : ""}`;
  };
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
          <section className="registrants-panel rounded-xl border border-slate-200 bg-white">
            <form
              action="/admin/dashboard"
              className="registrants-search flex flex-wrap items-end gap-2 p-4"
              aria-label="Filter dan pencarian pendaftar"
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
              <label className="min-w-36 text-sm font-semibold">
                Status
                <select
                  className="registrants-filter-select mt-1 w-full"
                  name="status"
                  defaultValue={status}
                >
                  <option value="">Semua status</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
              <label className="min-w-40 text-sm font-semibold">
                Urutkan
                <select
                  className="registrants-filter-select mt-1 w-full"
                  name="sort"
                  defaultValue={sort}
                >
                  <option value="newest">Tanggal terbaru</option>
                  <option value="oldest">Tanggal terlama</option>
                  <option value="name-asc">Nama A-Z</option>
                  <option value="name-desc">Nama Z-A</option>
                </select>
              </label>
              <Button>Terapkan</Button>
              {(q || status || sort !== "newest") && (
                <Button variant="outline" asChild>
                  <Link href="/admin/dashboard">Reset</Link>
                </Button>
              )}
            </form>
            {rows.length ? (
              <div
                className="registrants-table-scroll overflow-x-auto"
                role="region"
                aria-label="Tabel pendaftar; gulir horizontal untuk melihat semua kolom"
                tabIndex={0}
              >
                <table className="registrants-table">
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
                          {t === "Status" ? (
                            <>
                              Status
                              <span className="required-mark" aria-hidden="true">
                                *
                              </span>
                            </>
                          ) : (
                            t
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="registrant-primary">
                            <b className="registrant-name">{r.full_name}</b>
                            <div className="registrant-id mt-1 text-xs text-slate-600">
                              SA-{r.id.toUpperCase()}
                            </div>
                            <details className="registrant-details mt-2">
                              <summary className="cursor-pointer text-sm font-medium">
                                Data lengkap dan berkas
                              </summary>
                              <dl className="registrant-data mt-3 grid gap-2 text-sm">
                                {[
                                  ["NIK", r.nik],
                                  ["Nomor KK", r.kk_number],
                                  [
                                    "Tempat, tanggal lahir",
                                    [
                                      r.birth_place,
                                      r.birth_date instanceof Date
                                        ? r.birth_date.toISOString().slice(0, 10)
                                        : r.birth_date,
                                    ]
                                      .filter(Boolean)
                                      .join(", "),
                                  ],
                                  ["Jenis kelamin", r.gender],
                                  ["Agama", r.religion],
                                  ["Status pernikahan", r.marital_status],
                                  ["Alamat sesuai KTP", r.ktp_address],
                                  [
                                    "Alamat domisili",
                                    r.domicile_address || "Sama dengan alamat KTP",
                                  ],
                                  ["Email", r.email],
                                  ["Pendidikan terakhir", r.education_level],
                                  ["Asal institusi", r.school_name],
                                  ["Jurusan", r.major],
                                  ["Tahun kelulusan", r.graduation_year],
                                  ["Tinggi badan", r.height_cm && `${r.height_cm} cm`],
                                  ["Berat badan", r.weight_kg && `${r.weight_kg} kg`],
                                  ["Golongan darah", r.blood_type],
                                  ["Mata minus", r.eye_minus],
                                ].map(([label, value]) => (
                                  <div
                                    key={label}
                                    className="registrant-data-item grid grid-cols-2 gap-2"
                                  >
                                    <dt className="font-semibold">{label}</dt>
                                    <dd className="break-words">{value || "—"}</dd>
                                  </div>
                                ))}
                              </dl>
                              <ul className="registrant-documents mt-3 space-y-1 text-sm">
                                {(documentsByRegistration.get(r.id) ?? []).map(
                                  (document) => {
                                    const label = registrationDocuments.find(
                                      (item) => item.key === document.document_type,
                                    )?.label;
                                    return (
                                      <li key={document.document_id}>
                                        {label}:{" "}
                                        <a
                                          className="registrant-document-link"
                                          href={`/admin/berkas/${r.id}/${document.document_type}/${document.document_id}`}
                                        >
                                          Unduh
                                        </a>
                                      </li>
                                    );
                                  },
                                )}
                                {documentsByRegistration.has(r.id) && (
                                  <li className="registrant-download-all-row">
                                    <a
                                      className="registrant-download-all"
                                      href={`/admin/berkas/${r.id}/gabungan`}
                                    >
                                      Unduh semua berkas (PDF)
                                    </a>
                                  </li>
                                )}
                              </ul>
                            </details>
                          </div>
                        </td>
                        <td>
                          <span className="registrant-mobile-label">WhatsApp</span>
                          <div className="registrant-whatsapp">
                            <span>{r.whatsapp}</span>
                            <a
                              className="registrant-whatsapp-link"
                              href={whatsappHref(r.whatsapp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Hubungi ${r.full_name} di WhatsApp`}
                            >
                              Hubungi
                            </a>
                          </div>
                        </td>
                        <td>
                          <span className="registrant-mobile-label">Domisili</span>
                          <span>{r.domicile}</span>
                        </td>
                        <td>
                          <span className="registrant-mobile-label">Tanggal</span>
                          <span>{date.format(r.created_at)}</span>
                        </td>
                        <td>
                          <span className="registrant-mobile-label">Status</span>
                          <form
                            action={updateStatus}
                            className="registrant-status-form flex items-center gap-2"
                          >
                            <input type="hidden" name="id" value={r.id} />
                            <select
                              className="registrant-status-select"
                              name="status"
                              aria-label={"Status " + r.full_name}
                              defaultValue={r.status}
                              required
                            >
                              {states.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              className="registrant-save-button"
                              type="submit"
                            >
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
                {q || status
                  ? "Tidak ada pendaftar yang cocok."
                  : "Belum ada pendaftaran siswa."}
              </p>
            )}
            <div className="registrants-pagination flex items-center justify-between gap-3 p-4 text-sm">
              <span>
                {count.total} pendaftar · Halaman {page} dari {pages}
              </span>
              <div className="flex gap-3">
                {page > 1 && (
                  <Link className="registrant-page-link" href={href(page - 1)}>
                    Sebelumnya
                  </Link>
                )}
                {page < pages && (
                  <Link className="registrant-page-link" href={href(page + 1)}>
                    Berikutnya
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
