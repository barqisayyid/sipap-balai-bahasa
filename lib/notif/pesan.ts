import { formatRentangJam, formatTanggalPanjang } from "@/lib/date";

export interface AgendaNotif {
  id: number;
  perihal: string;
  pengirim: string | null;
  lokasi: string;
  linkMaps: string | null;
  waktuMulai: string;
  waktuSelesai: string;
  pakaian: string | null;
  pendamping: string | null;
  catatan?: string | null;
  status: "Menunggu Konfirmasi" | "Hadir" | "Didisposisikan" | "Batal";
  quickToken: string;
  dibuatPada: string;
}

const ANGKA = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
const FOOTER = "_Sistem Informasi Penjadwalan & Agenda Pimpinan (SIPAP)_";

function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

const urlKonfirmasi = (a: AgendaNotif, aksi: "hadir" | "disposisi") =>
  `${appUrl()}/a/confirm?token=${a.quickToken}&action=${aksi}`;

const urlAntrean = () => `${appUrl()}/agenda/antrean-konfirmasi`;

type Baris = string | null | false | undefined;

/** Gabungkan baris; null/false dibuang, "" dipertahankan sebagai baris kosong */
const gabung = (baris: Baris[]) =>
  baris.filter((b): b is string => typeof b === "string").join("\n");

const field = (emoji: string, label: string, nilai: string | null) =>
  nilai ? `${emoji} *${label}:* ${nilai}` : null;

const waktuLengkap = (a: AgendaNotif) =>
  `${formatTanggalPanjang(a.waktuMulai)} | ${formatRentangJam(a.waktuMulai, a.waktuSelesai)}`;

function statusTeks(s: AgendaNotif["status"]) {
  switch (s) {
    case "Hadir":
      return "✅ Terkonfirmasi Hadir";
    case "Didisposisikan":
      return "↪️ Didisposisikan";
    case "Batal":
      return "❌ Dibatalkan";
    default:
      return "⏳ Menunggu Konfirmasi";
  }
}

function blokKonfirmasi(a: AgendaNotif): Baris[] {
  if (a.status !== "Menunggu Konfirmasi") return [];
  return [
    "",
    "Konfirmasi Cepat (Tanpa Login):",
    `👉 *HADIR:* ${urlKonfirmasi(a, "hadir")}`,
    `👉 *DISPOSISIKAN:* ${urlKonfirmasi(a, "disposisi")}`,
  ];
}

const ROLE_TEXT: Record<string, string> = {
  pimpinan: "Pimpinan",
  superadmin: "Super Admin",
  pemantau: "Ajudan / Protokol",
  operator: "Operator / Pendamping",
};

/** Template 1A: Agenda baru untuk Pimpinan (memuat tombol konfirmasi cepat) */
export function pesanInstanPimpinan(a: AgendaNotif, nama?: string) {
  const sapaan = nama
    ? `Yth. Bapak Kepala Balai (*${nama}*),`
    : "Yth. Bapak Kepala Balai,";

  return gabung([
    "🏛️ *AGENDA KEDINASAN BARU*",
    "*Balai Bahasa Provinsi Sumatera Barat*",
    "",
    sapaan,
    "Telah dicatat agenda kedinasan baru yang memerlukan perhatian/konfirmasi Bapak:",
    "",
    field("📋", "Kegiatan", a.perihal),
    field("🏢", "Penyelenggara", a.pengirim),
    field("📅", "Waktu", waktuLengkap(a)),
    field("📍", "Tempat", a.lokasi),
    field("🗺️", "Peta", a.linkMaps),
    field("👔", "Pakaian", a.pakaian),
    field("👥", "Pendamping", a.pendamping),
    field("📝", "Catatan", a.catatan ?? null),
    ...blokKonfirmasi(a),
    "",
    FOOTER,
  ]);
}

/** Template 1B: Tembusan Agenda baru untuk Ajudan, Operator, & Super Admin (koordinasi jadwal & pendampingan) */
export function pesanInstanTembusan(
  a: AgendaNotif,
  penerima: { nama: string; role?: string },
) {
  const labelPeran =
    penerima.role && ROLE_TEXT[penerima.role]
      ? ` (${ROLE_TEXT[penerima.role]})`
      : "";
  const sapaan = `Yth. *${penerima.nama}*${labelPeran},`;
  const urlAgenda = `${appUrl()}/agenda/${a.id}`;

  return gabung([
    "🏛️ *[TEMBUSAN JADWAL] AGENDA KEPALA BALAI*",
    "*Balai Bahasa Provinsi Sumatera Barat*",
    "",
    sapaan,
    "Berikut pemberitahuan agenda kedinasan Kepala Balai untuk koordinasi jadwal, teknis, dan pendampingan:",
    "",
    field("📋", "Kegiatan", a.perihal),
    field("🏢", "Penyelenggara", a.pengirim),
    field("📅", "Waktu", waktuLengkap(a)),
    field("📍", "Tempat", a.lokasi),
    field("🗺️", "Peta", a.linkMaps),
    field("👔", "Pakaian", a.pakaian),
    field("👥", "Pendamping", a.pendamping),
    field("📝", "Catatan", a.catatan ?? null),
    `📌 *Status:* ${statusTeks(a.status)}`,
    "",
    "🔗 *Detail & Berkas Lampiran di SIPAP:*",
    `👉 ${urlAgenda}`,
    "",
    "_(Mohon tim pendamping/protokoler yang bertugas dapat mempersiapkan teknis dan perlengkapan dinas)_",
    "",
    FOOTER,
  ]);
}

/** Template 1: Wrapper yang memilih template sesuai peran penerima */
export function pesanInstan(
  a: AgendaNotif,
  penerima?: { nama: string; role?: string } | string,
) {
  if (typeof penerima === "string") {
    return pesanInstanPimpinan(a, penerima);
  }
  if (!penerima || penerima.role === "pimpinan") {
    return pesanInstanPimpinan(a, penerima?.nama);
  }
  return pesanInstanTembusan(a, penerima);
}

/** Template 2: rekap pagi */
export function pesanRekap(daftar: AgendaNotif[], tanggal: Date) {
  const isi = daftar.flatMap((a, i): Baris[] => [
    `${ANGKA[i] ?? `${i + 1}.`} *${formatRentangJam(a.waktuMulai, a.waktuSelesai)}*`,
    `• *Acara:* ${a.perihal}`,
    `• *Tempat:* ${a.lokasi}`,
    a.linkMaps && `• *Peta:* ${a.linkMaps}`,
    a.pakaian && `• *Pakaian:* ${a.pakaian}`,
    `• *Status:* ${statusTeks(a.status)}`,
    a.status === "Menunggu Konfirmasi" &&
      `• *Konfirmasi:* ${urlKonfirmasi(a, "hadir")}`,
    "",
  ]);

  return gabung([
    "🔔 *AGENDA KEPALA BALAI HARI INI*",
    "*Balai Bahasa Provinsi Sumatera Barat*",
    formatTanggalPanjang(tanggal),
    "",
    "Selamat pagi Bapak. Berikut daftar agenda kedinasan Anda hari ini:",
    "",
    ...isi,
    FOOTER,
  ]);
}

/** Pengingat H-1 (16.00) ke pimpinan */
export function pesanPengingatH1(a: AgendaNotif) {
  return gabung([
    "🔔 *PENGINGAT AGENDA BESOK*",
    "*Balai Bahasa Provinsi Sumatera Barat*",
    "",
    "Yth. Bapak Kepala Balai, besok ada agenda kedinasan:",
    "",
    field("📋", "Kegiatan", a.perihal),
    field("📅", "Waktu", waktuLengkap(a)),
    field("📍", "Tempat", a.lokasi),
    field("🗺️", "Peta", a.linkMaps),
    field("👔", "Pakaian", a.pakaian),
    field("👥", "Pendamping", a.pendamping),
    `📌 *Status:* ${statusTeks(a.status)}`,
    ...blokKonfirmasi(a),
  ]);
}

/** Pengingat 2 jam sebelum acara: pakaian & lokasi */
export function pesanPengingat2Jam(a: AgendaNotif) {
  return gabung([
    "⏰ *PENGINGAT: ACARA SEGERA DIMULAI*",
    "*Balai Bahasa Provinsi Sumatera Barat*",
    "",
    "Yth. Bapak Kepala Balai, agenda berikut dimulai sekitar 2 jam lagi:",
    "",
    field("📋", "Kegiatan", a.perihal),
    field("📅", "Waktu", waktuLengkap(a)),
    field("📍", "Tempat", a.lokasi),
    field("🗺️", "Peta", a.linkMaps),
    field("👔", "Pakaian", a.pakaian),
    field("👥", "Pendamping", a.pendamping),
    ...blokKonfirmasi(a),
  ]);
}

/** Template 3: eskalasi H-1 ke Ajudan/Pemantau (digabung satu pesan) */
export function pesanEskalasiH1(daftar: AgendaNotif[]) {
  const isi = daftar.flatMap((a): Baris[] => [
    field("📋", "Kegiatan", a.perihal),
    field("📅", "Waktu", waktuLengkap(a)),
    field("📍", "Tempat", a.lokasi),
    "",
  ]);

  return gabung([
    "⚠️ *ESKALASI: AGENDA BELUM DIKONFIRMASI*",
    "*Balai Bahasa Provinsi Sumatera Barat*",
    "",
    "Yth. Ajudan / Sekretaris Kepala Balai,",
    "Agenda berikut belum mendapatkan konfirmasi hingga batas waktu H-1:",
    "",
    ...isi,
    "Mohon pastikan kesediaan pimpinan dan perbarui status melalui aplikasi:",
    `👉 ${urlAntrean()}`,
  ]);
}

/** Peringatan darurat 1 jam sebelum acara (ke Ajudan & Admin) */
export function pesanDarurat(a: AgendaNotif) {
  return gabung([
    "🚨 *DARURAT: AGENDA BELUM DIKONFIRMASI*",
    "*Balai Bahasa Provinsi Sumatera Barat*",
    "",
    "Agenda berikut dimulai kurang dari 1 jam lagi dan belum ada konfirmasi pimpinan:",
    "",
    field("📋", "Kegiatan", a.perihal),
    field("📅", "Waktu", waktuLengkap(a)),
    field("📍", "Tempat", a.lokasi),
    "",
    "Segera hubungi pimpinan dan perbarui status:",
    `👉 ${urlAntrean()}`,
  ]);
}

/** Template: Notifikasi Akun Pengguna Baru */
export function pesanAkunBaru(p: {
  nama: string;
  email: string;
  labelRole: string;
  password?: string;
}) {
  const url = appUrl();
  return gabung([
    "🏛️ *AKUN BARU SIPAP*",
    "*Balai Bahasa Provinsi Sumatera Barat*",
    "",
    `Yth. *${p.nama}*,`,
    "Akun Anda telah berhasil didaftarkan ke sistem *SIPAP* (Sistem Informasi Penjadwalan & Agenda Pimpinan).",
    "",
    `👤 *Nama:* ${p.nama}`,
    `📧 *Email Login:* ${p.email}`,
    p.password ? `🔑 *Kata Sandi:* ${p.password}` : null,
    `🛡️ *Peran:* ${p.labelRole}`,
    "",
    `🌐 *Tautan Masuk:* ${url}/login`,
    "",
    "Nomor WhatsApp ini telah terhubung ke sistem untuk pengiriman notifikasi dan pembaruan agenda kedinasan.",
    "",
    FOOTER,
  ]);
}
