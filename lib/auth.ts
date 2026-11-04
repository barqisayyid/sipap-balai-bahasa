import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { StatusAgenda } from "@/lib/types";

export type Role =
  | "superadmin"
  | "pimpinan"
  | "pemantau"
  | "operator"
  | "pegawai";

export interface Profil {
  id: string;
  fullName: string;
  role: Role;
  phone: string;
}

export const LABEL_ROLE: Record<Role, string> = {
  superadmin: "Super Admin",
  pimpinan: "Pimpinan",
  pemantau: "Pemantau",
  operator: "Operator",
  pegawai: "Pegawai",
};

/** Profil pengguna yang sedang login (null jika belum login / tidak terdaftar / nonaktif) */
export const getProfil = cache(async (): Promise<Profil | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone_number, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!data || !data.is_active) return null;
  return {
    id: data.id,
    fullName: data.full_name,
    role: data.role as Role,
    phone: data.phone_number,
  };
});

export async function wajibLogin(): Promise<Profil> {
  const profil = await getProfil();
  if (!profil) redirect("/login?error=profil");
  return profil;
}

/** Hanya operator & superadmin yang boleh menambah/mengubah agenda */
export const bolehKelolaAgenda = (role: Role) =>
  role === "operator" || role === "superadmin";

/** Status yang boleh ditetapkan setiap peran lewat aplikasi (RBAC) */
export function statusBolehDiubah(role: Role): StatusAgenda[] {
  switch (role) {
    case "superadmin":
      return ["Hadir", "Didisposisikan", "Menunggu Konfirmasi", "Batal"];
    case "pimpinan":
    case "pemantau":
      return ["Hadir", "Didisposisikan", "Menunggu Konfirmasi"];
    case "operator":
      return ["Batal"];
    default:
      return [];
  }
}
