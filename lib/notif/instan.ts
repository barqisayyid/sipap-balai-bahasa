import "server-only";
import { pesanInstan } from "./pesan";
import {
  ambilAgendaNotifById,
  ambilPenerima,
  antrikan,
  buatRencana,
  prosesAntrean,
} from "./antrean";

/** Notifikasi instan saat agenda dibuat. Tidak pernah melempar error. */
export async function kirimNotifikasiInstan(agendaId: number): Promise<void> {
  try {
    const agenda = await ambilAgendaNotifById(agendaId);
    if (!agenda) return;

    const pimpinan = await ambilPenerima("pimpinan");
    const sekarang = new Date();
    const pesan = pesanInstan(agenda);

    await antrikan(
      pimpinan.map((p) =>
        buatRencana(
          p,
          "INSTANT_NEW",
          agenda.id,
          sekarang,
          `INSTAN:${agenda.id}:${p.id}`,
          pesan,
        ),
      ),
    );
    await prosesAntrean(new Date());
  } catch (e) {
    // Jika gagal, baris PENDING tetap di antrean dan akan dicoba ulang oleh cron
    console.error("[notif-instan]", e);
  }
}
