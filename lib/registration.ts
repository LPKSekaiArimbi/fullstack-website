export const registrationDocuments = [
  {
    key: "ktp",
    label: "KTP",
    accept: ".pdf",
    multiple: false,
  },
  {
    key: "kartu_keluarga",
    label: "Kartu Keluarga",
    accept: ".pdf",
    multiple: false,
  },
  {
    key: "akta_kelahiran",
    label: "Akta Kelahiran",
    accept: ".pdf",
    multiple: false,
  },
  {
    key: "ijazah",
    label: "Ijazah (SD s.d. Pendidikan Terakhir)",
    accept: ".pdf",
    multiple: true,
  },
  {
    key: "pas_foto",
    label: "Pas Foto",
    accept: ".pdf",
    multiple: false,
  },
  {
    key: "surat_izin_orang_tua",
    label: "Surat Izin Orang Tua",
    accept: ".pdf",
    multiple: false,
  },
  {
    key: "skck",
    label: "SKCK",
    accept: ".pdf",
    multiple: false,
  },
  {
    key: "kartu_kuning",
    label: "Kartu Kuning",
    accept: ".pdf",
    multiple: false,
  },
] as const;

export type RegistrationDocumentKey =
  (typeof registrationDocuments)[number]["key"];

export function isRegistrationDocumentKey(
  value: string,
): value is RegistrationDocumentKey {
  return registrationDocuments.some((document) => document.key === value);
}
