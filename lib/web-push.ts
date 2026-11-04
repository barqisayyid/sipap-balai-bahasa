import "server-only";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export interface MuatanPush {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface HasilPush {
  dikonfigurasi: boolean;
  terkirim: number;
  gagal: number;
  dihapus: number;
}

let siap = false;

function siapkan(): boolean {
  if (siap) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subjek = process.env.VAPID_SUBJECT;
  if (!pub || !priv || !subjek) return false;
  webpush.setVapidDetails(subjek, pub, priv);
  siap = true;
  return true;
}

/** Kirim push ke semua perangkat milik daftar pengguna. Tidak pernah melempar error. */
export async function kirimPushKeUser(
  userIds: string[],
  muatan: MuatanPush,
): Promise<HasilPush> {
  const hasil: HasilPush = {
    dikonfigurasi: siapkan(),
    terkirim: 0,
    gagal: 0,
    dihapus: 0,
  };
  if (!hasil.dikonfigurasi || userIds.length === 0) return hasil;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", userIds);
  if (error) {
    console.error("[push]", error.message);
    return hasil;
  }

  for (const s of data ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: s.endpoint as string,
          keys: { p256dh: s.p256dh as string, auth: s.auth as string },
        },
        JSON.stringify(muatan),
        { TTL: 2 * 60 * 60, urgency: "high" },
      );
      hasil.terkirim++;
    } catch (e) {
      const kode = (e as { statusCode?: number }).statusCode;
      if (kode === 404 || kode === 410) {
        // Langganan sudah tidak berlaku (aplikasi dihapus / izin dicabut)
        await admin.from("push_subscriptions").delete().eq("id", s.id);
        hasil.dihapus++;
      } else {
        hasil.gagal++;
        console.error("[push]", kode ?? e);
      }
    }
  }
  return hasil;
}
