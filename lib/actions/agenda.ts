"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { bolehKelolaAgenda, getProfil } from "@/lib/auth";
import {
  createAgenda,
  deleteAgenda,
  getAgendaBentrok,
  getAgendaById,
  updateAgenda,
} from "@/lib/data/agenda";
import { waktuWIB } from "@/lib/date";
import type { FormAgendaState } from "@/lib/types";
import { agendaSchema } from "@/lib/validation";
import { catatAudit } from "@/lib/audit";
import { after } from "next/server";
import { kirimNotifikasiInstan } from "@/lib/notif/instan";

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
  // Dikirim setelah respons selesai: kegagalan WA tidak menggagalkan penyimpanan
  after(() => kirimNotifikasiInstan(id));

  revalidatePath("/");
  revalidatePath("/kalender");
  revalidatePath("/agenda");
  redirect(`/agenda/${id}?baru=1`, RedirectType.replace);
}

export async function perbaruiAgenda(
  id: number,
  _sebelumnya: FormAgendaState | null,
  formData: FormData,
): Promise<FormAgendaState> {
  const profil = await getProfil();
  if (!profil || !bolehKelolaAgenda(profil.role)) {
    return { errors: { form: "Anda tidak memiliki izin mengubah agenda." } };
  }

  const agendaLama = await getAgendaById(id);
  if (!agendaLama) {
    return { errors: { form: "Agenda tidak ditemukan." } };
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

  // Pemeriksaan bentrok resmi, abaikan ID agenda ini sendiri
  const bentrok = await getAgendaBentrok(waktuMulai, waktuSelesai, id);
  if (bentrok.length > 0 && formData.get("izinkanBentrok") !== "on") {
    return {
      errors: {
        form: `Jadwal bentrok dengan ${bentrok.length} agenda lain. Centang konfirmasi untuk tetap menyimpan.`,
      },
    };
  }

  await updateAgenda(id, {
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
  });

  await catatAudit({
    userId: profil.id,
    aksi: "UPDATE",
    entitas: "agenda",
    entitasId: id,
    sebelum: {
      perihal: agendaLama.perihal,
      waktuMulai: agendaLama.waktuMulai,
      waktuSelesai: agendaLama.waktuSelesai,
      lokasi: agendaLama.lokasi,
    },
    sesudah: { perihal: d.perihal, waktuMulai, waktuSelesai, lokasi: d.lokasi },
  });

  revalidatePath("/");
  revalidatePath("/kalender");
  revalidatePath("/agenda");
  revalidatePath(`/agenda/${id}`);
  redirect(`/agenda/${id}?edit=1`, RedirectType.replace);
}

export async function hapusAgenda(
  id: number,
): Promise<{ ok: boolean; error?: string }> {
  const profil = await getProfil();
  if (!profil || !bolehKelolaAgenda(profil.role)) {
    return { ok: false, error: "Anda tidak memiliki izin menghapus agenda." };
  }

  const agenda = await getAgendaById(id);
  if (!agenda) {
    return { ok: false, error: "Agenda tidak ditemukan." };
  }

  await deleteAgenda(id);

  await catatAudit({
    userId: profil.id,
    aksi: "DELETE",
    entitas: "agenda",
    entitasId: id,
    sebelum: { perihal: agenda.perihal, waktuMulai: agenda.waktuMulai },
  });

  revalidatePath("/");
  revalidatePath("/kalender");
  revalidatePath("/agenda");
  revalidatePath("/agenda/antrean-konfirmasi");
  return { ok: true };
}
