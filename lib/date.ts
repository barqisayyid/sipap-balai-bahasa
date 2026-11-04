export const TZ = "Asia/Jakarta"; // WIB

// ⚠️ MODE DEMO: true = "hari ini" dikunci ke 5 Nov 2026 agar sama dengan mockup.
// Ubah ke false saat data nyata dari Supabase sudah dipakai.
const MODE_DEMO = false;
const WAKTU_DEMO = "2026-11-05T08:00:00+07:00";

export function getNow(): Date {
  return MODE_DEMO ? new Date(WAKTU_DEMO) : new Date();
}

/** "YYYY-MM-DD" menurut WIB */
export function dateKeyWIB(d: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(d));
}

/** "09.00" */
export function formatJam(d: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(d));
}

/** "09:00" untuk input type="time" */
export function formatJamInput(d: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(d));
}

/** "09.00 – 12.00 WIB" */
export function formatRentangJam(mulai: Date | string, selesai: Date | string) {
  return `${formatJam(mulai)} – ${formatJam(selesai)} WIB`;
}

/** "Kamis, 5 November 2026" */
export function formatTanggalPanjang(d: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

/** "Kam, 12 Nov" */
export function formatTanggalSingkat(d: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(d));
}

/** { hari: "05", bulan: "Nov", namaHari: "Kam" } */
export function bagianTanggal(d: Date | string) {
  const date = new Date(d);
  const fmt = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("id-ID", { timeZone: TZ, ...o }).format(date);
  return {
    hari: fmt({ day: "2-digit" }),
    bulan: fmt({ month: "short" }),
    namaHari: fmt({ weekday: "short" }),
  };
}

/** "Selamat pagi" / siang / sore / malam (berdasarkan jam WIB) */
export function salam(d: Date | string): string {
  const jam = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date(d)),
  );
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
}

/** Gabungkan "2026-11-05" + "09:00" menjadi ISO dengan zona WIB */
export function waktuWIB(tanggal: string, jam: string): string {
  return `${tanggal}T${jam}:00+07:00`;
}
