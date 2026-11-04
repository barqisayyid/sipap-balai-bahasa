"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { catatAudit } from "@/lib/audit";
import {
  periksaToken,
  STATUS_DARI_AKSI,
  type AksiQuick,
} from "@/lib/quick-action";
import { createAdminClient } from "@/lib/supabase/admin";

const adalahAksi = (v: string): v is AksiQuick =>
  v === "hadir" || v === "disposisi";

export async function konfirmasiQuick(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const aksi = String(formData.get("aksi") ?? "");
  const kembali = `/a/confirm?token=${encodeURIComponent(token)}`;

  if (!adalahAksi(aksi)) redirect(kembali);

  const cek = await periksaToken(token);
  if (!cek.ok) redirect(kembali);

  const statusBaru = STATUS_DARI_AKSI[aksi];
  const admin = createAdminClient();

  // Syarat "status masih Menunggu" ikut di UPDATE: jika dua permintaan
  // datang bersamaan, hanya satu yang berhasil (token sekali pakai).
  const { data, error } = await admin
    .from("agenda_pimpinan")
    .update({ status: statusBaru })
    .eq("id", cek.agenda.id)
    .eq("quick_token", token)
    .eq("status", "Menunggu Konfirmasi")
    .select("id");
  if (error) throw new Error(`Database: ${error.message}`);
  if (!data || data.length === 0) redirect(kembali);

  await catatAudit({
    userId: null,
    aksi: "CONFIRM",
    entitas: "agenda",
    entitasId: cek.agenda.id,
    sebelum: { status: "Menunggu Konfirmasi" },
    sesudah: { status: statusBaru, via: "quick-action" },
  });

  revalidatePath("/");
  revalidatePath("/kalender");
  revalidatePath("/agenda");
  revalidatePath("/agenda/antrean-konfirmasi");
  revalidatePath(`/agenda/${cek.agenda.id}`);

  redirect(`${kembali}&ok=1`);
}
