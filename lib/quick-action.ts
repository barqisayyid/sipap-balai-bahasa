import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StatusAgenda } from "@/lib/types";

export type AksiQuick = "hadir" | "disposisi";

export const STATUS_DARI_AKSI: Record<AksiQuick, StatusAgenda> = {
  hadir: "Hadir",
  disposisi: "Didisposisikan",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AgendaToken {
  id: number;
  perihal: string;
  lokasi: string;
  waktuMulai: string;
  waktuSelesai: string;
  pakaian?: string;
  status: StatusAgenda;
}

export type HasilToken =
  | { ok: true; agenda: AgendaToken }
  | {
      ok: false;
      alasan: "tidak_valid" | "dibatalkan" | "sudah_dipakai" | "kedaluwarsa";
      agenda?: AgendaToken;
    };

/** Memeriksa token. Token sah hanya jika agenda masih "Menunggu Konfirmasi",
 *  belum dibatalkan, dan acaranya belum selesai. */
export async function periksaToken(
  token: string | undefined,
): Promise<HasilToken> {
  if (!token || !UUID.test(token)) return { ok: false, alasan: "tidak_valid" };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("agenda_pimpinan")
    .select(
      "id, perihal, lokasi, waktu_mulai, waktu_selesai, pakaian, status, deleted_at",
    )
    .eq("quick_token", token)
    .maybeSingle();
  if (error) throw new Error(`Database: ${error.message}`);
  if (!data || data.deleted_at) return { ok: false, alasan: "tidak_valid" };

  const agenda: AgendaToken = {
    id: data.id as number,
    perihal: data.perihal as string,
    lokasi: data.lokasi as string,
    waktuMulai: data.waktu_mulai as string,
    waktuSelesai: data.waktu_selesai as string,
    pakaian: (data.pakaian as string | null) ?? undefined,
    status: data.status as StatusAgenda,
  };

  if (agenda.status === "Batal")
    return { ok: false, alasan: "dibatalkan", agenda };
  if (agenda.status !== "Menunggu Konfirmasi")
    return { ok: false, alasan: "sudah_dipakai", agenda };
  if (new Date(agenda.waktuSelesai).getTime() < Date.now())
    return { ok: false, alasan: "kedaluwarsa", agenda };

  return { ok: true, agenda };
}
