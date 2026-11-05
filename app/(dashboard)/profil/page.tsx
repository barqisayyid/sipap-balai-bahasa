import Link from "next/link";
import {
  ChevronRight,
  LogOut,
  Phone,
  Send,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { AktifkanPush } from "@/components/pwa/aktifkan-push";
import { PasangAplikasi } from "@/components/pwa/pasang-aplikasi";
import { LABEL_ROLE, wajibLogin } from "@/lib/auth";
import { keluar } from "@/lib/actions/auth";

export default async function ProfilPage() {
  const profil = await wajibLogin();

  return (
    <div className="px-5 pt-5 pb-24">
      <section className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-brand-primary">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-slate-900">
            Profil Pengguna
          </h1>
          <p className="text-[11px] text-slate-500">
            Balai Bahasa Sumatera Barat
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <p className="text-[17px] font-semibold tracking-tight text-slate-900">
          {profil.fullName}
        </p>
        <dl className="mt-3.5 space-y-2.5 text-[13.5px]">
          <div className="flex items-center gap-2.5 text-slate-700">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <dt className="sr-only">Peran</dt>
            <dd className="font-medium text-slate-800">{LABEL_ROLE[profil.role]}</dd>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <Phone className="h-4 w-4 text-slate-400" />
            <dt className="sr-only">Nomor WhatsApp</dt>
            <dd className="text-[13px] font-medium tabular-nums text-slate-800">+{profil.phone}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-3 space-y-2.5">
        <PasangAplikasi />
        <AktifkanPush />
      </section>

      {profil.role === "superadmin" && (
        <section className="mt-4 space-y-2">
          <p className="px-1 text-[11px] font-medium text-slate-500">
            Administrasi sistem
          </p>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-2xs">
            <Link
              href="/admin/pengguna"
              className="flex items-center justify-between rounded-xl p-3 text-[13.5px] font-medium text-slate-800 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="leading-tight font-semibold">Kelola Pengguna</p>
                  <p className="text-[11px] text-slate-400">
                    Tambah, edit, dan atur hak akses peran
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>

            <Link
              href="/admin/log-notifikasi"
              className="flex items-center justify-between rounded-xl p-3 text-[13.5px] font-medium text-slate-800 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <p className="leading-tight font-semibold">Log Notifikasi WhatsApp</p>
                  <p className="text-[11px] text-slate-400">
                    Riwayat antrean dan status pengiriman pesan
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
          </div>
        </section>
      )}

      <form action={keluar} className="mt-5">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 text-[14px] font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </form>
    </div>
  );
}
