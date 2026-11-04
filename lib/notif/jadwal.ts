// Semua jam dalam WIB.
export const JADWAL = {
  rekapPagi: "06:30",
  pengingatH1: "16:00",
  eskalasiH1: "18:30",
  pengingatSebelumMenit: 120, // pengingat 2 jam sebelum acara
  daruratSebelumMenit: 60, // peringatan darurat 1 jam sebelum acara

  // Berapa lama setelah jam jatuh tempo pesan masih boleh dikirim
  // (menutup kemungkinan cron terlewat beberapa menit).
  graceRekapMenit: 240,
  gracePengingatH1Menit: 180,
  graceEskalasiH1Menit: 210,
} as const;

export const MAKS_PERCOBAAN = 3;
export const JEDA_ULANG_MENIT = 5;
