"use server";

import { redirect } from "next/navigation";
import { getProfil } from "@/lib/auth";
import { kirimWA } from "@/lib/fonnte";

export async function kirimUji() {
  const profil = await getProfil();
  if (!profil || profil.role !== "superadmin") redirect("/");

  const h = await kirimWA(
    profil.phone,
    "✅ *SIPAP*: pesan uji coba berhasil diterima. Koneksi WhatsApp Gateway berfungsi.",
  );

  redirect(
    h.ok
      ? "/admin/log-notifikasi?uji=ok"
      : `/admin/log-notifikasi?uji=gagal&alasan=${encodeURIComponent(h.alasan ?? "Tidak diketahui")}`,
  );
}
