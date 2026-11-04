import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { kirimPushKeUser } from "@/lib/web-push";
import { MAKS_PERCOBAAN } from "./jadwal";

const JUDUL: Record<string, string> = {
  INSTANT_NEW: "Agenda baru",
  REKAP_PAGI: "Agenda hari ini",
  REMINDER_H1: "Pengingat agenda besok",
  REMINDER_2JAM: "Acara segera dimulai",
  ESKALASI_PEMANTAU: "Agenda belum dikonfirmasi",
  ESKALASI_ADMIN: "DARURAT: agenda belum dikonfirmasi",
};

export interface PesanGagal {
  id: number;
  tipe: string;
  penerimaId: string | null;
  agendaId: number | null;
  isiPesan: string;
}

/** Ubah teks WhatsApp menjadi ringkasan pendek untuk notifikasi push */
const ringkas = (teks: string) =>
  teks
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_]/g, "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" · ")
    .slice(0, 180);

export async function tanganiGagalPermanen(
  p: PesanGagal,
  alasan: string,
  now: Date,
): Promise<void> {
  try {
    const admin = createAdminClient();
    const sekarang = now.toISOString();

    // 1. Saluran cadangan: Web Push ke penerima yang sama
    if (p.penerimaId) {
      const h = await kirimPushKeUser([p.penerimaId], {
        title: JUDUL[p.tipe] ?? "SIPAP",
        body: ringkas(p.isiPesan),
        url: p.agendaId ? `/agenda/${p.agendaId}` : "/",
        tag: `notif-${p.id}`,
      });
      await admin.from("notifikasi_log").upsert(
        {
          agenda_id: p.agendaId,
          penerima_id: p.penerimaId,
          nomor_tujuan: "webpush",
          saluran: "webpush",
          tipe: p.tipe,
          jadwal_kirim: sekarang,
          status: h.terkirim > 0 ? "SUCCESS" : "FAILED",
          percobaan_ke: 1,
          sent_at: h.terkirim > 0 ? sekarang : null,
          isi_pesan: p.isiPesan,
          pesan_error:
            h.terkirim > 0
              ? null
              : h.dikonfigurasi
                ? "Tidak ada perangkat terdaftar atau semua gagal"
                : "VAPID belum dikonfigurasi",
          kunci_dedupe: `PUSH:${p.id}`,
        },
        { onConflict: "kunci_dedupe", ignoreDuplicates: true },
      );
    }

    // 2. Alert ke Admin: maksimal satu kali per jam agar tidak menyepam
    const { data: admins } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "superadmin")
      .eq("is_active", true);
    const jam = sekarang.slice(0, 13);

    for (const a of admins ?? []) {
      const adminId = a.id as string;
      const { data: baru } = await admin
        .from("notifikasi_log")
        .upsert(
          {
            penerima_id: adminId,
            nomor_tujuan: "webpush",
            saluran: "webpush",
            tipe: "ESKALASI_ADMIN",
            jadwal_kirim: sekarang,
            status: "PENDING",
            percobaan_ke: 1,
            isi_pesan: `Alert: WhatsApp gagal. ${alasan}`,
            kunci_dedupe: `ALERT_WA:${jam}:${adminId}`,
          },
          { onConflict: "kunci_dedupe", ignoreDuplicates: true },
        )
        .select("id");
      if (!baru || baru.length === 0) continue; // alert jam ini sudah dikirim

      const h = await kirimPushKeUser([adminId], {
        title: "⚠️ SIPAP: WhatsApp gagal terkirim",
        body: `Pesan gagal setelah ${MAKS_PERCOBAAN} percobaan (${alasan}). Periksa sesi Fonnte.`,
        url: "/admin/log-notifikasi",
        tag: "alert-wa",
      });
      await admin
        .from("notifikasi_log")
        .update({
          status: h.terkirim > 0 ? "SUCCESS" : "FAILED",
          sent_at: h.terkirim > 0 ? sekarang : null,
          pesan_error: h.terkirim > 0 ? null : "Admin belum mengaktifkan push",
        })
        .eq("id", baru[0].id);
    }
  } catch (e) {
    console.error("[fallback]", e);
  }
}
