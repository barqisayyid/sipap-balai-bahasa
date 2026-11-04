"use server";

import { revalidatePath } from "next/cache";
import { bolehKelolaAgenda, getProfil } from "@/lib/auth";
import { getAgendaById } from "@/lib/data/agenda";
import {
  BUCKET_SURAT,
  MAKS_LAMPIRAN,
  MAKS_UKURAN_BYTE,
  MIME_DIIZINKAN,
} from "@/lib/lampiran-config";
import { createClient } from "@/lib/supabase/server";

type Hasil = { error?: string };

/** Dipanggil browser SETELAH berkas berhasil diunggah ke Storage */
export async function catatLampiran(
  agendaId: number,
  path: string,
  namaAsli: string,
): Promise<Hasil> {
  const profil = await getProfil();
  if (!profil || !bolehKelolaAgenda(profil.role)) {
    return { error: "Anda tidak memiliki izin mengunggah surat." };
  }
  if (!Number.isInteger(agendaId)) return { error: "Agenda tidak valid." };

  const folder = `agenda-${agendaId}`;
  const namaBerkas = path.slice(folder.length + 1);
  if (
    !path.startsWith(`${folder}/`) ||
    namaBerkas === "" ||
    namaBerkas.includes("/") ||
    path.includes("..")
  ) {
    return { error: "Lokasi berkas tidak valid." };
  }

  const agenda = await getAgendaById(agendaId);
  if (!agenda) return { error: "Agenda tidak ditemukan." };
  if (agenda.isSensitive) {
    return { error: "Agenda sensitif tidak menerima unggahan surat." };
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("lampiran_surat")
    .select("id", { count: "exact", head: true })
    .eq("agenda_id", agendaId);
  if ((count ?? 0) >= MAKS_LAMPIRAN) {
    return { error: `Maksimal ${MAKS_LAMPIRAN} berkas per agenda.` };
  }

  // Ambil ukuran & tipe SEBENARNYA dari Storage (bukan dari klaim browser)
  const { data: daftar } = await supabase.storage
    .from(BUCKET_SURAT)
    .list(folder, { search: namaBerkas, limit: 10 });
  const obj = daftar?.find((o) => o.name === namaBerkas);
  if (!obj) return { error: "Berkas tidak ditemukan di penyimpanan." };

  const ukuran = Number(obj.metadata?.size ?? 0);
  const mime = String(obj.metadata?.mimetype ?? "");
  if (
    ukuran > MAKS_UKURAN_BYTE ||
    !(MIME_DIIZINKAN as readonly string[]).includes(mime)
  ) {
    return { error: "Berkas tidak memenuhi syarat (PDF/JPG/PNG, maks. 5 MB)." };
  }

  const nama = namaAsli.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 200);

  const { error } = await supabase.from("lampiran_surat").insert({
    agenda_id: agendaId,
    file_path: path,
    file_name: nama || "surat",
    file_size_bytes: ukuran,
    mime_type: mime,
    uploaded_by: profil.id,
  });
  if (error) return { error: `Gagal mencatat berkas: ${error.message}` };

  revalidatePath(`/agenda/${agendaId}`);
  return {};
}

export async function hapusLampiran(lampiranId: number): Promise<Hasil> {
  const profil = await getProfil();
  if (!profil || !bolehKelolaAgenda(profil.role)) {
    return { error: "Anda tidak memiliki izin menghapus surat." };
  }

  const supabase = await createClient();
  const { data: baris } = await supabase
    .from("lampiran_surat")
    .select("id, agenda_id, file_path")
    .eq("id", lampiranId)
    .maybeSingle();
  if (!baris) return { error: "Berkas tidak ditemukan." };

  // Hapus catatan dulu; berkas fisik menyusul (jika gagal hanya menyisakan berkas yatim)
  const { error } = await supabase
    .from("lampiran_surat")
    .delete()
    .eq("id", lampiranId);
  if (error) return { error: `Gagal menghapus: ${error.message}` };

  await supabase.storage.from(BUCKET_SURAT).remove([baris.file_path as string]);

  revalidatePath(`/agenda/${baris.agenda_id}`);
  return {};
}
