import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Users,
  UserX,
} from "lucide-react";
import { wajibLogin } from "@/lib/auth";
import { getDaftarPengguna } from "@/lib/data/pengguna";
import { PenggunaCard } from "@/components/admin/pengguna-card";

export const metadata = {
  title: "Kelola Pengguna - SIPAP Balai Bahasa Sumatera Barat",
};

export default async function KelolaPenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const profil = await wajibLogin();
  if (profil.role !== "superadmin") redirect("/");

  const sp = await searchParams;
  const filterRole = sp.role ?? "semua";

  const daftarPengguna = await getDaftarPengguna();

  const total = daftarPengguna.length;
  const totalAktif = daftarPengguna.filter((p) => p.isActive).length;
  const totalNonaktif = total - totalAktif;

  const filtered =
    filterRole === "semua"
      ? daftarPengguna
      : filterRole === "nonaktif"
        ? daftarPengguna.filter((p) => !p.isActive)
        : daftarPengguna.filter((p) => p.role === filterRole && p.isActive);

  const TABS = [
    { kunci: "semua", label: "Semua" },
    { kunci: "pimpinan", label: "Pimpinan" },
    { kunci: "pemantau", label: "Ajudan" },
    { kunci: "operator", label: "Operator" },
    { kunci: "superadmin", label: "Super Admin" },
    { kunci: "nonaktif", label: "Nonaktif" },
  ];

  return (
    <div className="px-5 pt-6 pb-24">
      {/* Tombol Kembali ke Profil */}
      <div className="mb-3">
        <Link
          href="/profil"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Profil
        </Link>
      </div>

      {/* Header Utama */}
      <section className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F5EE] text-brand-primary shadow-xs">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Kelola Pengguna
            </h1>
            <p className="text-xs text-slate-500">
              {total} pengguna terdaftar di SIPAP
            </p>
          </div>
        </div>

        <Link
          href="/admin/pengguna/baru"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3.5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-brand-dark active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Tambah
        </Link>
      </section>

      {/* Ringkasan Ringkas */}
      <div className="mb-5 grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-xs">
          <p className="text-[20px] font-extrabold text-slate-900">{total}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
            Total
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 text-center shadow-xs">
          <p className="text-[20px] font-extrabold text-emerald-800">
            {totalAktif}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">
            Aktif
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-xs">
          <p className="text-[20px] font-extrabold text-slate-600">
            {totalNonaktif}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
            Nonaktif
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 text-[13px] font-bold scrollbar-none">
        {TABS.map((t) => {
          const aktif = filterRole === t.kunci;
          return (
            <Link
              key={t.kunci}
              href={
                t.kunci === "semua"
                  ? "/admin/pengguna"
                  : `/admin/pengguna?role=${t.kunci}`
              }
              className={`shrink-0 rounded-full px-3.5 py-1.5 transition-all ${
                aktif
                  ? "bg-brand-primary text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Daftar Pengguna */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <UserX className="h-6 w-6" />
          </div>
          <p className="text-[15px] font-bold text-slate-800">
            Tidak ada pengguna
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            Tidak ditemukan data pengguna untuk kategori filter ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <PenggunaCard
              key={item.id}
              pengguna={item}
              currentUserId={profil.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
