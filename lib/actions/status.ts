"use server";

import { revalidatePath } from "next/cache";
import { getProfil, statusBolehDiubah } from "@/lib/auth";
import { catatAudit } from "@/lib/audit";
import { getAgendaById } from "@/lib/data/agenda";
import { createClient } from "@/lib/supabase/server";
import type { StatusAgenda } from "@/lib/types";

export async function ubahStatus(
  agendaId: number,
  status: StatusAgenda,
): Promise<{ error?: string }> {
  const profil = await getProfil();
  if (!profil) return { error: "Sesi berakhir. Silakan login ulang." };
  if (!Number.isInteger(agendaId)) return { error: "Agenda tidak valid." };
  if (!statusBolehDiubah(profil.role).includes(status)) {
    return { error: "Anda tidak memiliki izin untuk tindakan ini." };
  }

  const agenda = await getAgendaById(agendaId);
  if (!agenda) return { error: "Agenda tidak ditemukan." };
  if (agenda.status === status) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agenda_pimpinan")
    .update({ status })
    .eq("id", agendaId)
    .select("id");
  if (error) return { error: `Gagal menyimpan: ${error.message}` };
  if (!data || data.length === 0) {
    return { error: "Perubahan ditolak oleh sistem." };
  }

  await catatAudit({
    userId: profil.id,
    aksi: "UPDATE",
    entitas: "agenda",
    entitasId: agendaId,
    sebelum: { status: agenda.status },
    sesudah: { status, via: "aplikasi" },
  });

  revalidatePath("/");
  revalidatePath("/kalender");
  revalidatePath("/agenda");
  revalidatePath("/agenda/antrean-konfirmasi");
  revalidatePath(`/agenda/${agendaId}`);
  return {};
}
