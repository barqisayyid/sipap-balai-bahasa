import type { StatusAgenda } from "@/lib/types";

interface Rentang {
  waktuMulai: string;
  waktuSelesai: string;
}

interface AgendaWaktu extends Rentang {
  id: number;
  status: StatusAgenda;
}

/**
 * Mengembalikan agenda aktif yang waktunya beririsan dengan `kandidat`.
 * Dua rentang bentrok jika: mulaiA < selesaiB DAN selesaiA > mulaiB.
 * Rentang yang hanya bersentuhan (12.00 selesai, 12.00 mulai) TIDAK bentrok.
 */
export function cariBentrok<T extends AgendaWaktu>(
  kandidat: Rentang,
  daftar: T[],
  abaikanId?: number,
): T[] {
  const mulai = new Date(kandidat.waktuMulai).getTime();
  const selesai = new Date(kandidat.waktuSelesai).getTime();

  return daftar.filter(
    (a) =>
      a.id !== abaikanId &&
      a.status !== "Batal" &&
      mulai < new Date(a.waktuSelesai).getTime() &&
      selesai > new Date(a.waktuMulai).getTime(),
  );
}
