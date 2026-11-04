"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function masuk(
  _sebelumnya: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password)
    return { error: "Email dan kata sandi wajib diisi." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) return { error: "Email atau kata sandi salah." };

  // FR-01: tolak akun yang tidak terdaftar / nonaktif di tabel profiles
  const { data: profil } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profil?.is_active) {
    await supabase.auth.signOut();
    return {
      error: "Akun Anda belum terdaftar di SIPAP atau sudah dinonaktifkan.",
    };
  }

  redirect("/");
}

export async function keluar() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
