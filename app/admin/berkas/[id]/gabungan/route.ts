import { PDFDocument } from "pdf-lib";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

const uuid =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

type DocumentRow = {
  file_name: string;
  content_type: string;
  file_data: Buffer;
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  if (!uuid.test(id))
    return new Response("Pendaftaran tidak ditemukan.", { status: 404 });

  const documents = await sql()<DocumentRow[]>`
    SELECT file_name,content_type,file_data
    FROM registration_documents
    WHERE registration_id=${id}
    ORDER BY CASE document_type
      WHEN 'ktp' THEN 0
      WHEN 'kartu_keluarga' THEN 1
      WHEN 'akta_kelahiran' THEN 2
      WHEN 'ijazah' THEN 3
      WHEN 'pas_foto' THEN 4
      WHEN 'surat_izin_orang_tua' THEN 5
      WHEN 'skck' THEN 6
      WHEN 'kartu_kuning' THEN 7
      ELSE 8
    END, created_at, document_id
  `;
  if (!documents.length)
    return new Response("Tidak ada berkas untuk digabungkan.", {
      status: 404,
    });

  const mergedPdf = await PDFDocument.create();
  mergedPdf.setTitle(`Berkas pendaftaran SA-${id.toUpperCase()}`);
  mergedPdf.setCreator("LPK Sekai Arimbi");

  for (const document of documents) {
    const fileData = new Uint8Array(document.file_data.length);
    fileData.set(document.file_data);
    if (
      document.content_type !== "application/pdf" ||
      Buffer.from(fileData.subarray(0, 5)).toString() !== "%PDF-"
    )
      return new Response(
        `Berkas "${document.file_name}" bukan PDF yang dapat digabungkan.`,
        { status: 422 },
      );

    try {
      const sourcePdf = await PDFDocument.load(fileData);
      const pageIndices = sourcePdf.getPageIndices();
      if (!pageIndices.length)
        return new Response(
          `Berkas "${document.file_name}" tidak memiliki halaman PDF.`,
          { status: 422 },
        );
      const pages = await mergedPdf.copyPages(sourcePdf, pageIndices);
      for (const page of pages) mergedPdf.addPage(page);
    } catch {
      return new Response(
        `Berkas "${document.file_name}" tidak dapat dibaca. Pastikan PDF tidak rusak atau terkunci kata sandi.`,
        { status: 422 },
      );
    }
  }

  const pdfBytes = await mergedPdf.save();
  const body = new Uint8Array(pdfBytes.length);
  body.set(pdfBytes);
  return new Response(body.buffer, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="SA-${id.toUpperCase()}-berkas.pdf"`,
      "Content-Length": String(body.byteLength),
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
