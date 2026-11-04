import { dateKeyWIB } from "@/lib/date";

export const HARI_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export interface TahunBulan {
  tahun: number;
  bulan: number; // 1-12
}

/** Baca "?bulan=2026-11"; jika tidak valid, pakai bulan dari tanggal `cadangan` */
export function parseBulan(
  param: string | undefined,
  cadangan: Date,
): TahunBulan {
  const m = param?.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (m) return { tahun: Number(m[1]), bulan: Number(m[2]) };
  const [tahun, bulan] = dateKeyWIB(cadangan).split("-").map(Number);
  return { tahun, bulan };
}

export const kunciBulan = ({ tahun, bulan }: TahunBulan) =>
  `${tahun}-${String(bulan).padStart(2, "0")}`;

export const kunciTanggal = (tb: TahunBulan, hari: number) =>
  `${kunciBulan(tb)}-${String(hari).padStart(2, "0")}`;

export function bulanSebelumnya({ tahun, bulan }: TahunBulan): TahunBulan {
  return bulan === 1
    ? { tahun: tahun - 1, bulan: 12 }
    : { tahun, bulan: bulan - 1 };
}

export function bulanBerikutnya({ tahun, bulan }: TahunBulan): TahunBulan {
  return bulan === 12
    ? { tahun: tahun + 1, bulan: 1 }
    : { tahun, bulan: bulan + 1 };
}

/** Daftar sel grid: `null` = sel kosong sebelum tanggal 1, angka = tanggal. Minggu = kolom pertama. */
export function buatGridBulan({ tahun, bulan }: TahunBulan): (number | null)[] {
  const hariPertama = new Date(Date.UTC(tahun, bulan - 1, 1)).getUTCDay();
  const jumlahHari = new Date(Date.UTC(tahun, bulan, 0)).getUTCDate();
  return [
    ...Array<null>(hariPertama).fill(null),
    ...Array.from({ length: jumlahHari }, (_, i) => i + 1),
  ];
}

/** "November 2026" */
export function namaBulanTahun({ tahun, bulan }: TahunBulan): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(tahun, bulan - 1, 1)));
}
