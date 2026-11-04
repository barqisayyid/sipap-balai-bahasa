"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bolehKelolaAgenda, getProfil } from "@/lib/auth";
import { createAgenda, getAgendaBentrok } from "@/lib/data/agenda";
import { waktuWIB } from "@/lib/date";
import type { FormAgendaState } from "@/lib/types";
import { agendaSchema } from "@/lib/validation";
import { catatAudit } from "@/lib/audit";

const teks = (fd: FormData, kunci: string) => {
  const v = fd.get(kunci);
  return typeof v === "string" ? v : "";
};

const opsional = (v: string) => (v === "" ? undefined : v);

export async function simpanAgenda(
  _sebelumnya: FormAgendaState | null,
  formData: FormData,
): Promise<FormAgendaState> {
  // Otorisasi di server (RBAC): hanya operator & superadmin
  const profil = await getProfil();
  if (!profil || !bolehKelolaAgenda(profil.role)) {
    return { errors: { form: "Anda tidak memiliki izin menambah agenda." } };
  }

  const hasil = agendaSchema.safeParse({
    perihal: teks(formData, "perihal"),
    tanggal: teks(formData, "tanggal"),
    jamMulai: teks(formData, "jamMulai"),
    jamSelesai: teks(formData, "jamSelesai"),
    lokasi: teks(formData, "lokasi"),
    pengirim: teks(formData, "pengirim"),
    nomorSurat: teks(formData, "nomorSurat"),
    pakaian: teks(formData, "pakaian"),
    pendamping: teks(formData, "pendamping"),
    catatan: teks(formData, "catatan"),
    linkMaps: teks(formData, "linkMaps"),
    isSensitive: formData.get("isSensitive") === "on",
  });

  if (!hasil.success) {
    const errors: Record<string, string> = {};
    for (const isu of hasil.error.issues) {
      const kunci = String(isu.path[0] ?? "form");
      if (!errors[kunci]) errors[kunci] = isu.message;
    }
    return { errors };
  }

  const d = hasil.data;
  const waktuMulai = waktuWIB(d.tanggal, d.jamMulai);
  const waktuSelesai = waktuWIB(d.tanggal, d.jamSelesai);

  // Pemeriksaan bentrok resmi (di database)
  const bentrok = await getAgendaBentrok(waktuMulai, waktuSelesai);
  if (bentrok.length > 0 && formData.get("izinkanBentrok") !== "on") {
    return {
      errors: {
        form: `Jadwal bentrok dengan ${bentrok.length} agenda lain. Centang konfirmasi untuk tetap menyimpan.`,
      },
    };
  }

  const id = await createAgenda(
    {
      perihal: d.perihal,
      lokasi: d.lokasi,
      waktuMulai,
      waktuSelesai,
      pengirim: opsional(d.pengirim),
      nomorSurat: opsional(d.nomorSurat),
      pakaian: opsional(d.pakaian),
      pendamping: opsional(d.pendamping),
      catatan: opsional(d.catatan),
      linkMaps: opsional(d.linkMaps),
      isSensitive: d.isSensitive,
    },
    profil.id,
  );

    await catatAudit({
      userId: profil.id,
      aksi: "CREATE",
      entitas: "agenda",
      entitasId: id,
      sesudah: { perihal: d.perihal, waktuMulai, waktuSelesai },
    });
    
  revalidatePath("/");
  revalidatePath("/kalender");
  revalidatePath("/agenda");
  redirect(`/agenda/${id}?baru=1`);
}
