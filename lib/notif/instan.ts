import "server-only";
import { pesanInstan } from "./pesan";
import {
  ambilAgendaNotifById,
  ambilPenerima,
  antrikan,
  buatRencana,
  prosesAntrean,
} from "./antrean";

/**
 * Notifikasi instan saat agenda dibuat:
 * - Pimpinan menerima notifikasi aksi konfirmasi cepat (HADIR / DISPOSISIKAN).
 * - Ajudan (Pemantau), Operator (Pendamping), dan Super Admin menerima tembusan koordinasi jadwal & detail agenda.
 */
export async function kirimNotifikasiInstan(agendaId: number): Promise<void> {
  try {
    const agenda = await ambilAgendaNotifById(agendaId);
    if (!agenda) return;

    // Ambil penerima dari semua peran terkait
    const [pimpinan, pemantau, operator, admin] = await Promise.all([
      ambilPenerima("pimpinan"),
      ambilPenerima("pemantau"),
      ambilPenerima("operator"),
      ambilPenerima("superadmin"),
    ]);

    // Urutan prioritas: Pimpinan -> Pemantau (Ajudan) -> Operator (Pendamping) -> Super Admin
    const semuaPenerima = [...pimpinan, ...pemantau, ...operator, ...admin];

    // Hindari nomor WhatsApp yang sama menerima pesan ganda
    const mapNomor = new Map<string, (typeof semuaPenerima)[number]>();
    for (const p of semuaPenerima) {
      if (!mapNomor.has(p.nomor)) {
        mapNomor.set(p.nomor, p);
      }
    }
    const penerima = Array.from(mapNomor.values());
    if (penerima.length === 0) return;

    const sekarang = new Date();

    await antrikan(
      penerima.map((p) =>
        buatRencana(
          p,
          "INSTANT_NEW",
          agenda.id,
          sekarang,
          `INSTAN:${agenda.id}:${p.id}`,
          pesanInstan(agenda, { nama: p.nama, role: p.role }),
        ),
      ),
    );
    await prosesAntrean(new Date());
  } catch (e) {
    // Jika gagal, baris PENDING tetap di antrean dan akan dicoba ulang oleh cron
    console.error("[notif-instan]", e);
  }
}
