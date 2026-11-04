import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Mencatat "siapa melakukan apa". Kegagalan mencatat tidak boleh menggagalkan aksi utama. */
export async function catatAudit(p: {
  userId: string | null; // null = aksi lewat token Quick-Action
  aksi: "CREATE" | "UPDATE" | "CONFIRM" | "DELETE";
  entitas: string;
  entitasId: number;
  sebelum?: unknown;
  sesudah?: unknown;
}) {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("audit_logs").insert({
      user_id: p.userId,
      aksi: p.aksi,
      entitas: p.entitas,
      entitas_id: p.entitasId,
      data_sebelum: p.sebelum ?? null,
      data_sesudah: p.sesudah ?? null,
    });
    if (error) console.error("[audit]", error.message);
  } catch (e) {
    console.error("[audit]", e);
  }
}
