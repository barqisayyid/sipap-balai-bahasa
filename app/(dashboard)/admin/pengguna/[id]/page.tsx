import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, UserCog } from "lucide-react";
import { wajibLogin } from "@/lib/auth";
import { getPenggunaById } from "@/lib/data/pengguna";
import { PenggunaForm } from "@/components/admin/pengguna-form";

export const metadata = {
  title: "Ubah Data Pengguna - SIPAP Balai Bahasa",
};

export default async function UbahPenggunaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profil = await wajibLogin();
  if (profil.role !== "superadmin") redirect("/");

  const { id } = await params;
  const pengguna = await getPenggunaById(id);

  if (!pengguna) {
    notFound();
  }

  return (
    <div className="px-5 pt-6">
      {/* Tombol Kembali */}
      <div className="mb-3">
        <Link
          href="/admin/pengguna"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Daftar Pengguna
        </Link>
      </div>

      {/* Header */}
      <section className="mb-6 flex items-center gap-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F5EE] text-brand-primary shadow-xs">
          <UserCog className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Ubah Data Pengguna
          </h1>
          <p className="text-xs text-slate-500">{pengguna.fullName}</p>
        </div>
      </section>

      {/* Form Edit */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <PenggunaForm
          mode="edit"
          dataAwal={pengguna}
          currentUserId={profil.id}
        />
      </div>
    </div>
  );
}
