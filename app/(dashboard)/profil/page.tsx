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
    <div className="px-5 pt-6 pb-24">
      <section className="mb-5 mt-2 flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5EE] text-brand-primary shadow-xs">
          <User className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Profil
        </h1>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-[22px] font-extrabold tracking-tight text-slate-900">
          {profil.fullName}
        </p>
        <dl className="mt-4 space-y-3 text-[14px]">
          <div className="flex items-center gap-3 text-slate-700">
            <ShieldCheck className="h-5 w-5 text-slate-400" />
            <dt className="sr-only">Peran</dt>
            <dd className="font-semibold">{LABEL_ROLE[profil.role]}</dd>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Phone className="h-5 w-5 text-slate-400" />
            <dt className="sr-only">Nomor WhatsApp</dt>
            <dd className="font-semibold">+{profil.phone}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 space-y-3">
        <PasangAplikasi />
        <AktifkanPush />
      </section>

      {profil.role === "superadmin" && (
        <section className="mt-5 space-y-2">
          <p className="px-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Administrasi Sistem
          </p>
          <div className="divide-y divide-slate-100 rounded-3xl border border-slate-100 bg-white p-1.5 shadow-sm">
            <Link
              href="/admin/pengguna"
              className="flex items-center justify-between rounded-2xl p-3 text-[14px] font-bold text-slate-800 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="leading-tight">Kelola Pengguna</p>
                  <p className="text-[11px] font-medium text-slate-400">
                    Tambah, edit, dan atur hak akses peran
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>

            <Link
              href="/admin/log-notifikasi"
              className="flex items-center justify-between rounded-2xl p-3 text-[14px] font-bold text-slate-800 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <p className="leading-tight">Log Notifikasi WhatsApp</p>
                  <p className="text-[11px] font-medium text-slate-400">
                    Riwayat antrean dan status pengiriman pesan
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
          </div>
        </section>
      )}

      <form action={keluar} className="mt-6">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-red-200 py-3.5 text-[15px] font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.99]"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </form>
    </div>
  );
}
