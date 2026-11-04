"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfil } from "@/lib/auth";
import { LABEL_ROLE, type Role } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalisasiNomor, kirimWA } from "@/lib/fonnte";
import { pesanAkunBaru } from "@/lib/notif/pesan";

export interface FormPenggunaState {
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
}

const ROLES_VALID: Role[] = [
  "pimpinan",
  "pemantau",
  "operator",
  "superadmin",
  "pegawai",
];

export async function simpanPenggunaBaru(
  _sebelumnya: FormPenggunaState | null,
  formData: FormData,
): Promise<FormPenggunaState> {
  const adminCurrent = await getProfil();
  if (!adminCurrent || adminCurrent.role !== "superadmin") {
    return {
      errors: {
        form: "Akses ditolak: Hanya Super Admin yang berwenang menambah pengguna.",
      },
    };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const isActive =
    formData.get("isActive") === "on" || formData.get("isActive") === "true";

  const errors: Record<string, string> = {};

  if (!fullName || fullName.length < 2) {
    errors.fullName = "Nama lengkap minimal 2 karakter.";
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Alamat email tidak valid.";
  }
  if (!password || password.length < 6) {
    errors.password = "Kata sandi minimal 6 karakter.";
  }
  if (!ROLES_VALID.includes(role)) {
    errors.role = "Pilih peran pengguna yang sah.";
  }
  const phone = normalisasiNomor(rawPhone);
  if (!phone) {
    errors.phone =
      "Nomor WhatsApp tidak valid (contoh: 08123456789 atau 628123456789).";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const admin = createAdminClient();

  // 1. Buat auth user di Supabase Auth
  const { data: authUser, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (authError || !authUser.user) {
    const isDuplicate =
      authError?.message?.toLowerCase().includes("already registered") ||
      authError?.message?.toLowerCase().includes("already in use");
    return {
      errors: {
        email: isDuplicate
          ? "Email ini sudah terdaftar di sistem."
          : `Gagal membuat akun auth: ${authError?.message}`,
      },
    };
  }

  // 2. Buat profil di public.profiles
  const { error: profileError } = await admin.from("profiles").insert({
    id: authUser.user.id,
    full_name: fullName,
    role,
    phone_number: phone!,
    is_active: isActive,
  });

  if (profileError) {
    // Rollback auth user
    await admin.auth.admin.deleteUser(authUser.user.id);
    return {
      errors: { form: `Gagal menyimpan profil: ${profileError.message}` },
    };
  }

  // 3. Kirim notifikasi selamat datang & info kredensial via WhatsApp
  try {
    const pesan = pesanAkunBaru({
      nama: fullName,
      email,
      labelRole: LABEL_ROLE[role] ?? role,
      password,
    });
    await kirimWA(phone!, pesan);
  } catch (errWA) {
    console.error("[notif-akun-baru]", errWA);
  }

  revalidatePath("/admin/pengguna");
  redirect("/admin/pengguna");
}

export async function perbaruiPengguna(
  _sebelumnya: FormPenggunaState | null,
  formData: FormData,
): Promise<FormPenggunaState> {
  const adminCurrent = await getProfil();
  if (!adminCurrent || adminCurrent.role !== "superadmin") {
    return {
      errors: {
        form: "Akses ditolak: Hanya Super Admin yang berwenang mengubah data pengguna.",
      },
    };
  }

  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const newPassword = String(formData.get("newPassword") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const isActive =
    formData.get("isActive") === "on" || formData.get("isActive") === "true";

  const errors: Record<string, string> = {};

  if (!id) {
    errors.form = "ID pengguna tidak ditemukan.";
  }
  if (!fullName || fullName.length < 2) {
    errors.fullName = "Nama lengkap minimal 2 karakter.";
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Alamat email tidak valid.";
  }
  if (newPassword && newPassword.length < 6) {
    errors.newPassword = "Kata sandi baru minimal 6 karakter.";
  }
  if (!ROLES_VALID.includes(role)) {
    errors.role = "Pilih peran pengguna yang sah.";
  }
  const phone = normalisasiNomor(rawPhone);
  if (!phone) {
    errors.phone =
      "Nomor WhatsApp tidak valid (contoh: 08123456789 atau 628123456789).";
  }

  // Proteksi diri (Self-lockout prevention)
  if (adminCurrent.id === id) {
    if (!isActive) {
      errors.isActive =
        "Anda tidak dapat menonaktifkan akun sendiri yang sedang aktif digunakan.";
    }
    if (role !== "superadmin") {
      errors.role =
        "Anda tidak dapat mencabut hak akses Super Admin dari akun Anda sendiri.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const admin = createAdminClient();

  // 1. Update Auth User (Email / Password / Metadata)
  const authUpdate: {
    email?: string;
    password?: string;
    user_metadata?: { full_name: string };
  } = {
    user_metadata: { full_name: fullName },
  };
  if (email) authUpdate.email = email;
  if (newPassword) authUpdate.password = newPassword;

  const { error: authError } = await admin.auth.admin.updateUserById(
    id,
    authUpdate,
  );
  if (authError) {
    return {
      errors: {
        form: `Gagal memperbarui autentikasi: ${authError.message}`,
      },
    };
  }

  // 2. Update Data Profil
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      role,
      phone_number: phone!,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (profileError) {
    return {
      errors: { form: `Gagal memperbarui profil: ${profileError.message}` },
    };
  }

  revalidatePath("/admin/pengguna");
  revalidatePath(`/admin/pengguna/${id}`);
  redirect("/admin/pengguna");
}

export async function hapusPengguna(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const adminCurrent = await getProfil();
  if (!adminCurrent || adminCurrent.role !== "superadmin") {
    return {
      ok: false,
      error: "Hanya Super Admin yang berwenang menghapus pengguna.",
    };
  }

  if (adminCurrent.id === id) {
    return {
      ok: false,
      error: "Anda tidak dapat menghapus akun Anda sendiri.",
    };
  }

  const admin = createAdminClient();

  // Hapus dari profiles
  const { error: errProf } = await admin.from("profiles").delete().eq("id", id);
  if (errProf) {
    return { ok: false, error: `Gagal menghapus profil: ${errProf.message}` };
  }

  // Hapus dari auth.users
  const { error: errAuth } = await admin.auth.admin.deleteUser(id);
  if (errAuth) {
    return {
      ok: false,
      error: `Gagal menghapus akun autentikasi: ${errAuth.message}`,
    };
  }

  revalidatePath("/admin/pengguna");
  return { ok: true };
}

export async function alihkanStatusPengguna(
  id: string,
  isActiveBaru: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const adminCurrent = await getProfil();
  if (!adminCurrent || adminCurrent.role !== "superadmin") {
    return { ok: false, error: "Akses ditolak." };
  }

  if (adminCurrent.id === id && !isActiveBaru) {
    return {
      ok: false,
      error: "Anda tidak dapat menonaktifkan akun sendiri.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      is_active: isActiveBaru,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/pengguna");
  return { ok: true };
}

/** Kirim ulang info akun pengguna via WhatsApp */
export async function kirimUlangInfoWA(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  const adminCurrent = await getProfil();
  if (!adminCurrent || adminCurrent.role !== "superadmin") {
    return { ok: false, message: "Akses ditolak." };
  }

  const admin = createAdminClient();
  const { data: p } = await admin
    .from("profiles")
    .select("full_name, phone_number, role")
    .eq("id", id)
    .maybeSingle();

  if (!p) return { ok: false, message: "Profil tidak ditemukan." };

  const { data: authData } = await admin.auth.admin.getUserById(id);
  const email = authData?.user?.email ?? "-";

  const pesan = pesanAkunBaru({
    nama: p.full_name,
    email,
    labelRole: LABEL_ROLE[p.role as Role] ?? p.role,
  });

  const res = await kirimWA(p.phone_number, pesan);
  return {
    ok: res.ok,
    message: res.ok
      ? "Notifikasi WhatsApp berhasil dikirim!"
      : res.alasan ?? "Gagal mengirim WhatsApp",
  };
}
