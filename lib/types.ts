export type StatusAgenda =
  | "Menunggu Konfirmasi"
  | "Hadir"
  | "Didisposisikan"
  | "Batal";

export type Role =
  | "superadmin"
  | "pimpinan"
  | "pemantau"
  | "operator"
  | "pegawai";

export const LABEL_ROLE: Record<Role, string> = {
  superadmin: "Super Admin",
  pimpinan: "Pimpinan",
  pemantau: "Pemantau",
  operator: "Operator",
  pegawai: "Pegawai",
};

export interface PenggunaItem {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  phone: string;
  isActive: boolean;
  createdAt: string;
  lastSignInAt?: string | null;
}

// Mengikuti kolom tabel agenda_pimpinan di PRD (camelCase)
export interface Agenda {
  id: number;
  perihal: string;
  pengirim?: string;
  nomorSurat?: string;
  lokasi: string;
  linkMaps?: string;
  waktuMulai: string; // ISO 8601, contoh "2026-11-05T09:00:00+07:00"
  waktuSelesai: string;
  pakaian?: string;
  pendamping?: string;
  catatan?: string;
  status: StatusAgenda;
  isSensitive: boolean;
}

/** Data agenda yang cukup untuk deteksi bentrok (dikirim ke form di browser) */
export type AgendaRingkas = Pick<
  Agenda,
  "id" | "perihal" | "waktuMulai" | "waktuSelesai" | "status"
>;

export interface FormAgendaState {
  errors?: Record<string, string>;
}
