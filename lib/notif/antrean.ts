import "server-only";
import { tanganiGagalPermanen } from "./fallback";
import { dateKeyWIB } from "@/lib/date";
import { kirimWA, normalisasiNomor } from "@/lib/fonnte";
import { createAdminClient } from "@/lib/supabase/admin";
import { JADWAL, JEDA_ULANG_MENIT, MAKS_PERCOBAAN } from "./jadwal";
import {
  pesanDarurat,
  pesanEskalasiH1,
  pesanPengingat2Jam,
  pesanPengingatH1,
  pesanRekap,
  type AgendaNotif,
} from "./pesan";

export type TipeNotif =
  | "INSTANT_NEW"
  | "REKAP_PAGI"
  | "REMINDER_H1"
  | "REMINDER_2JAM"
  | "ESKALASI_PEMANTAU"
  | "ESKALASI_ADMIN";

export type RolePenerima = "pimpinan" | "pemantau" | "superadmin" | "operator";

export interface Penerima {
  id: string;
  nama: string;
  nomor: string;
  role?: RolePenerima;
}

export interface RencanaNotif {
  agenda_id: number | null;
  penerima_id: string;
  nomor_tujuan: string;
  tipe: TipeNotif;
  jadwal_kirim: string;
  kunci_dedupe: string;
  isi_pesan: string;
  namaPenerima: string;
}

const MENIT = 60_000;
const tidur = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- Pengambilan data ----------

export async function ambilPenerima(
  role: RolePenerima,
): Promise<Penerima[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, phone_number, role")
    .eq("role", role)
    .eq("is_active", true);
  if (error) throw new Error(`Database: ${error.message}`);

  return (data ?? []).flatMap((p) => {
    const nomor = normalisasiNomor(String(p.phone_number ?? ""));
    if (!nomor) {
      console.warn(`[notif] Nomor ${p.full_name} tidak valid, dilewati`);
      return [];
    }
    return [
      {
        id: p.id as string,
        nama: p.full_name as string,
        nomor,
        role: (p.role as RolePenerima) ?? role,
      },
    ];
  });
}

const KOLOM =
  "id, perihal, pengirim, lokasi, link_maps, waktu_mulai, waktu_selesai, pakaian, pendamping, catatan, status, quick_token, created_at";

interface BarisAgenda {
  id: number;
  perihal: string;
  pengirim: string | null;
  lokasi: string;
  link_maps: string | null;
  waktu_mulai: string;
  waktu_selesai: string;
  pakaian: string | null;
  pendamping: string | null;
  catatan: string | null;
  status: AgendaNotif["status"];
  quick_token: string;
  created_at: string;
}

const petakan = (r: BarisAgenda): AgendaNotif => ({
  id: r.id,
  perihal: r.perihal,
  pengirim: r.pengirim,
  lokasi: r.lokasi,
  linkMaps: r.link_maps,
  waktuMulai: r.waktu_mulai,
  waktuSelesai: r.waktu_selesai,
  pakaian: r.pakaian,
  pendamping: r.pendamping,
  catatan: r.catatan,
  status: r.status,
  quickToken: r.quick_token,
  dibuatPada: r.created_at,
});

export async function ambilAgendaNotifById(
  id: number,
): Promise<AgendaNotif | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("agenda_pimpinan")
    .select(KOLOM)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(`Database: ${error.message}`);
  return data ? petakan(data as unknown as BarisAgenda) : null;
}

async function ambilAgendaRentang(
  dari: Date,
  sampai: Date,
): Promise<AgendaNotif[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("agenda_pimpinan")
    .select(KOLOM)
    .is("deleted_at", null)
    .gte("waktu_mulai", dari.toISOString())
    .lt("waktu_mulai", sampai.toISOString())
    .order("waktu_mulai");
  if (error) throw new Error(`Database: ${error.message}`);
  return ((data ?? []) as unknown as BarisAgenda[]).map(petakan);
}

// ---------- Perencanaan: pesan apa yang jatuh tempo? ----------

export function buatRencana(
  p: Penerima,
  tipe: TipeNotif,
  agendaId: number | null,
  jadwal: Date,
  kunci: string,
  pesan: string,
): RencanaNotif {
  return {
    agenda_id: agendaId,
    penerima_id: p.id,
    nomor_tujuan: p.nomor,
    tipe,
    jadwal_kirim: jadwal.toISOString(),
    kunci_dedupe: kunci,
    isi_pesan: pesan,
    namaPenerima: p.nama,
  };
}

const waktuWIB = (tanggal: string, hhmm: string) =>
  new Date(`${tanggal}T${hhmm}:00+07:00`);

const dalamJendela = (now: Date, jatuhTempo: Date, graceMenit: number) =>
  now >= jatuhTempo &&
  now.getTime() < jatuhTempo.getTime() + graceMenit * MENIT;

/** Menghitung semua pesan yang SEHARUSNYA sudah dikirim pada waktu `now`.
 *  Aman dipanggil berulang: duplikat dicegah oleh kunci_dedupe saat antrikan(). */
export async function rencanakanNotifikasi(now: Date): Promise<RencanaNotif[]> {
  const hariIni = dateKeyWIB(now);
  const besok = dateKeyWIB(new Date(now.getTime() + 86_400_000));
  const lusa = dateKeyWIB(new Date(now.getTime() + 2 * 86_400_000));

  const [pimpinan, pemantau, admin, semua] = await Promise.all([
    ambilPenerima("pimpinan"),
    ambilPenerima("pemantau"),
    ambilPenerima("superadmin"),
    ambilAgendaRentang(waktuWIB(hariIni, "00:00"), waktuWIB(lusa, "00:00")),
  ]);

  const aktif = semua.filter((a) => a.status !== "Batal");
  const hasil: RencanaNotif[] = [];

  // 1. Rekap pagi (hanya jika ada agenda hari ini)
  const dueRekap = waktuWIB(hariIni, JADWAL.rekapPagi);
  if (dalamJendela(now, dueRekap, JADWAL.graceRekapMenit)) {
    const hariIniList = aktif.filter(
      (a) => dateKeyWIB(a.waktuMulai) === hariIni,
    );
    if (hariIniList.length > 0) {
      const pesan = pesanRekap(hariIniList, now);
      for (const p of pimpinan) {
        hasil.push(
          buatRencana(
            p,
            "REKAP_PAGI",
            null,
            dueRekap,
            `REKAP:${hariIni}:${p.id}`,
            pesan,
          ),
        );
      }
    }
  }

  // 2. Pengingat H-1 ke pimpinan
  const dueH1 = waktuWIB(hariIni, JADWAL.pengingatH1);
  if (dalamJendela(now, dueH1, JADWAL.gracePengingatH1Menit)) {
    const besokList = aktif.filter(
      (a) =>
        dateKeyWIB(a.waktuMulai) === besok &&
        a.status !== "Didisposisikan" &&
        new Date(a.dibuatPada) <= dueH1,
    );
    for (const a of besokList) {
      for (const p of pimpinan) {
        hasil.push(
          buatRencana(
            p,
            "REMINDER_H1",
            a.id,
            dueH1,
            `H1:${a.id}:${p.id}`,
            pesanPengingatH1(a),
          ),
        );
      }
    }
  }

  // 3. Eskalasi H-1 ke pemantau (satu pesan gabungan per penerima)
  const dueEsk = waktuWIB(hariIni, JADWAL.eskalasiH1);
  if (dalamJendela(now, dueEsk, JADWAL.graceEskalasiH1Menit)) {
    const belum = aktif.filter(
      (a) =>
        dateKeyWIB(a.waktuMulai) === besok &&
        a.status === "Menunggu Konfirmasi" &&
        new Date(a.dibuatPada) <= dueEsk,
    );
    if (belum.length > 0) {
      const pesan = pesanEskalasiH1(belum);
      for (const p of pemantau) {
        hasil.push(
          buatRencana(
            p,
            "ESKALASI_PEMANTAU",
            null,
            dueEsk,
            `ESKALASI_H1:${besok}:${p.id}`,
            pesan,
          ),
        );
      }
    }
  }

  // 4. Pengingat 2 jam & peringatan darurat 1 jam (per agenda)
  for (const a of aktif) {
    const mulai = new Date(a.waktuMulai);
    if (mulai <= now) continue;
    const dibuat = new Date(a.dibuatPada);

    const due2 = new Date(
      mulai.getTime() - JADWAL.pengingatSebelumMenit * MENIT,
    );
    if (a.status !== "Didisposisikan" && now >= due2 && dibuat <= due2) {
      for (const p of pimpinan) {
        hasil.push(
          buatRencana(
            p,
            "REMINDER_2JAM",
            a.id,
            due2,
            `H2J:${a.id}:${p.id}`,
            pesanPengingat2Jam(a),
          ),
        );
      }
    }

    const dueD = new Date(mulai.getTime() - JADWAL.daruratSebelumMenit * MENIT);
    if (a.status === "Menunggu Konfirmasi" && now >= dueD && dibuat <= dueD) {
      for (const p of [...pemantau, ...admin]) {
        hasil.push(
          buatRencana(
            p,
            "ESKALASI_ADMIN",
            a.id,
            dueD,
            `DARURAT:${a.id}:${p.id}`,
            pesanDarurat(a),
          ),
        );
      }
    }
  }

  return hasil;
}

// ---------- Antrean & pengiriman ----------

/** Masukkan ke antrean. Pesan dengan kunci_dedupe yang sudah ada diabaikan. */
export async function antrikan(rencana: RencanaNotif[]): Promise<void> {
  if (rencana.length === 0) return;
  const admin = createAdminClient();
  const baris = rencana.map((r) => ({
    agenda_id: r.agenda_id,
    penerima_id: r.penerima_id,
    nomor_tujuan: r.nomor_tujuan,
    saluran: "whatsapp",
    tipe: r.tipe,
    jadwal_kirim: r.jadwal_kirim,
    kunci_dedupe: r.kunci_dedupe,
    isi_pesan: r.isi_pesan,
  }));
  const { error } = await admin
    .from("notifikasi_log")
    .upsert(baris, { onConflict: "kunci_dedupe", ignoreDuplicates: true });
  if (error) throw new Error(`Database: ${error.message}`);
}

/** Kirim pesan yang sudah jatuh tempo (termasuk percobaan ulang). */
export async function prosesAntrean(now: Date, batas = 15) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifikasi_log")
    .select(
      "id, tipe, penerima_id, agenda_id, nomor_tujuan, isi_pesan, percobaan_ke, coba_lagi_pada",
    )
    .eq("saluran", "whatsapp")
    .in("status", ["PENDING", "FAILED"])
    .lt("percobaan_ke", MAKS_PERCOBAAN)
    .lte("jadwal_kirim", now.toISOString())
    .not("isi_pesan", "is", null)
    .order("jadwal_kirim")
    .limit(50);
  if (error) throw new Error(`Database: ${error.message}`);

  const siap = (data ?? [])
    .filter(
      (r) => !r.coba_lagi_pada || new Date(r.coba_lagi_pada as string) <= now,
    )
    .slice(0, batas);

  let terkirim = 0;
  let gagal = 0;

  for (let i = 0; i < siap.length; i++) {
    const r = siap[i];
    const percobaan = Number(r.percobaan_ke);

    // "Klaim" baris: hanya satu pemanggil yang menang jika cron tumpang tindih
    const { data: klaim } = await admin
      .from("notifikasi_log")
      .update({
        percobaan_ke: percobaan + 1,
        coba_lagi_pada: new Date(
          now.getTime() + JEDA_ULANG_MENIT * MENIT,
        ).toISOString(),
      })
      .eq("id", r.id)
      .eq("percobaan_ke", percobaan)
      .in("status", ["PENDING", "FAILED"])
      .select("id");
    if (!klaim || klaim.length === 0) continue;

    const h = await kirimWA(r.nomor_tujuan as string, r.isi_pesan as string);

    await admin
      .from("notifikasi_log")
      .update(
        h.ok
          ? {
              status: "SUCCESS",
              sent_at: new Date().toISOString(),
              response_payload: h.payload ?? null,
              pesan_error: null,
            }
          : {
              status: "FAILED",
              response_payload: h.payload ?? null,
              pesan_error: h.alasan ?? "Gagal mengirim",
            },
      )
      .eq("id", r.id);

        if (h.ok) {
          terkirim++;
        } else {
          gagal++;
          if (percobaan + 1 >= MAKS_PERCOBAAN) {
            // Percobaan terakhir gagal: alihkan ke Web Push + beri tahu Admin
            await tanganiGagalPermanen(
              {
                id: r.id as number,
                tipe: r.tipe as string,
                penerimaId: r.penerima_id as string | null,
                agendaId: r.agenda_id as number | null,
                isiPesan: r.isi_pesan as string,
              },
              h.alasan ?? "Gagal mengirim",
              now,
            );
          }
        }

    if (i < siap.length - 1) await tidur(1000); // jeda ramah antar pesan
  }

  return { terkirim, gagal, diproses: siap.length };
}
