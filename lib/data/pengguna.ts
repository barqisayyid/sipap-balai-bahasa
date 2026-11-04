import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PenggunaItem, Role } from "@/lib/types";

export type { PenggunaItem };

export async function getDaftarPengguna(): Promise<PenggunaItem[]> {
  const admin = createAdminClient();

  // 1. Ambil data dari public.profiles
  const { data: profiles, error: errProf } = await admin
    .from("profiles")
    .select("id, full_name, role, phone_number, is_active, created_at")
    .order("created_at", { ascending: true });

  if (errProf) {
    throw new Error(`Database error (profiles): ${errProf.message}`);
  }

  // 2. Ambil data dari auth.users untuk melengkapi email & riwayat login
  const { data: authData, error: errAuth } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (errAuth) {
    throw new Error(`Database error (auth): ${errAuth.message}`);
  }

  const userMap = new Map<
    string,
    { email: string; lastSignInAt: string | null }
  >();
  for (const u of authData.users) {
    userMap.set(u.id, {
      email: u.email ?? "-",
      lastSignInAt: u.last_sign_in_at ?? null,
    });
  }

  return (profiles ?? []).map((p) => {
    const auth = userMap.get(p.id);
    return {
      id: p.id,
      fullName: p.full_name,
      email: auth?.email ?? "-",
      role: p.role as Role,
      phone: p.phone_number,
      isActive: p.is_active,
      createdAt: p.created_at,
      lastSignInAt: auth?.lastSignInAt,
    };
  });
}

export async function getPenggunaById(
  id: string,
): Promise<PenggunaItem | null> {
  const admin = createAdminClient();

  const { data: p, error: errProf } = await admin
    .from("profiles")
    .select("id, full_name, role, phone_number, is_active, created_at")
    .eq("id", id)
    .maybeSingle();

  if (errProf || !p) return null;

  const { data: authData } = await admin.auth.admin.getUserById(id);

  return {
    id: p.id,
    fullName: p.full_name,
    email: authData?.user?.email ?? "",
    role: p.role as Role,
    phone: p.phone_number,
    isActive: p.is_active,
    createdAt: p.created_at,
    lastSignInAt: authData?.user?.last_sign_in_at ?? null,
  };
}
