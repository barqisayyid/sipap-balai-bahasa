import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, UserPlus } from "lucide-react";
import { wajibLogin } from "@/lib/auth";
import { PenggunaForm } from "@/components/admin/pengguna-form";

export const metadata = {
  title: "Tambah Pengguna Baru - SIPAP Balai Bahasa",
};

export default async function TambahPenggunaPage() {
  const profil = await wajibLogin();
  if (profil.role !== "superadmin") redirect("/");

  return (
    <div className="px-5 pt-5 pb-24">
      {/* Tombol Kembali */}
      <div className="mb-3">
        <Link
          href="/admin/pengguna"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Daftar Pengguna
        </Link>
      </div>

      {/* Header */}
      <section className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-brand-primary">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-slate-900">
            Tambah Pengguna Baru
          </h1>
          <p className="text-[11px] text-slate-500">
            Daftarkan akun staf atau pimpinan ke SIPAP
          </p>
        </div>
      </section>

      {/* Form */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <PenggunaForm mode="baru" currentUserId={profil.id} />
      </div>
    </div>
  );
}
