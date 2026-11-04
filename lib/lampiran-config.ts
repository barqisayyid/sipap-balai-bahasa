export const BUCKET_SURAT = "surat";
export const MAKS_UKURAN_BYTE = 5 * 1024 * 1024; // 5 MB
export const MAKS_LAMPIRAN = 5; // per agenda
export const SIGNED_URL_DETIK = 60 * 60; // 60 menit (sesuai PRD)

export const MIME_DIIZINKAN = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const EKSTENSI: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};
