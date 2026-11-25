export const registrationDocuments = [
  {
    key: "ktp",
    label: "KTP",
    accept: ".pdf,.jpg,.jpeg,.png",
    multiple: false,
  },
  {
    key: "kartu_keluarga",
    label: "Kartu Keluarga",
    accept: ".pdf,.jpg,.jpeg,.png",
    multiple: false,
  },
  {
    key: "akta_kelahiran",
    label: "Akta Kelahiran",
    accept: ".pdf,.jpg,.jpeg,.png",
    multiple: false,
  },
  {
    key: "ijazah",
    label: "Ijazah (SD s.d. SMA/K sederajat)",
    accept: ".pdf,.jpg,.jpeg,.png",
    multiple: true,
  },
  {
    key: "pas_foto",
    label: "Pas foto",
    accept: ".jpg,.jpeg,.png",
    multiple: false,
  },
  {
    key: "surat_izin_orang_tua",
    label: "Surat izin orang tua",
    accept: ".pdf,.jpg,.jpeg,.png",
    multiple: false,
  },
  {
    key: "skck",
    label: "SKCK",
    accept: ".pdf,.jpg,.jpeg,.png",
    multiple: false,
  },
  {
    key: "kartu_kuning",
    label: "Kartu kuning",
    accept: ".pdf,.jpg,.jpeg,.png",
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
