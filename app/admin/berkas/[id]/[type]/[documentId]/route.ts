import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { isRegistrationDocumentKey } from "@/lib/registration";

export const runtime = "nodejs";

const uuid =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string; type: string; documentId: string }> },
) {
  await requireAdmin();
  const { id, type, documentId } = await params;
  if (
    !uuid.test(id) ||
    !uuid.test(documentId) ||
    !isRegistrationDocumentKey(type)
  )
    return new Response("Berkas tidak ditemukan.", { status: 404 });

  const [document] = await sql()<{
    file_name: string;
    file_data: Buffer;
  }[]>`SELECT file_name,file_data FROM registration_documents
    WHERE registration_id=${id} AND document_type=${type} AND document_id=${documentId}`;
  if (!document)
    return new Response("Berkas tidak ditemukan.", { status: 404 });

  const fileName = document.file_name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileData = new Uint8Array(document.file_data.length);
  fileData.set(document.file_data);
  return new Response(fileData.buffer, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
