"use server";

import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { kirimPushKeUser } from "@/lib/web-push";

interface LanggananInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function simpanLangganan(
  sub: LanggananInput,
): Promise<{ error?: string }> {
  const profil = await getProfil();
  if (!profil) return { error: "Sesi berakhir. Silakan login ulang." };

  const { endpoint } = sub;
  const { p256dh, auth } = sub.keys ?? {};
  if (
    typeof endpoint !== "string" ||
    !endpoint.startsWith("https://") ||
    endpoint.length > 2000 ||
    !p256dh ||
    !auth
  ) {
    return { error: "Data langganan tidak valid." };
  }

  // Memakai klien admin: satu perangkat bisa berpindah akun, dan endpoint bersifat unik
  const admin = createAdminClient();
  const { error } = await admin
    .from("push_subscriptions")
    .upsert(
      { user_id: profil.id, endpoint, p256dh, auth },
      { onConflict: "endpoint" },
    );
  if (error) return { error: `Gagal menyimpan: ${error.message}` };
  return {};
}

export async function hapusLangganan(
  endpoint: string,
): Promise<{ error?: string }> {
  const profil = await getProfil();
  if (!profil) return { error: "Sesi berakhir. Silakan login ulang." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", profil.id);
  if (error) return { error: `Gagal menghapus: ${error.message}` };
  return {};
}

export async function kirimPushUji(): Promise<{
  error?: string;
  terkirim?: number;
}> {
  const profil = await getProfil();
  if (!profil) return { error: "Sesi berakhir. Silakan login ulang." };

  const hasil = await kirimPushKeUser([profil.id], {
    title: "SIPAP",
    body: "Notifikasi uji coba berhasil diterima di perangkat ini.",
    url: "/profil",
    tag: "uji",
  });
  if (!hasil.dikonfigurasi) {
    return { error: "Kunci VAPID belum diatur di server." };
  }
  if (hasil.terkirim === 0) {
    return { error: "Belum ada perangkat terdaftar, atau pengiriman gagal." };
  }
  return { terkirim: hasil.terkirim };
}
