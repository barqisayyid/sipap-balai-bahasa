"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import type { PenggunaItem, Role } from "@/lib/types";
import {
  perbaruiPengguna,
  simpanPenggunaBaru,
  type FormPenggunaState,
} from "@/lib/actions/pengguna";

const DAFTAR_ROLE: {
  kunci: Role;
  label: string;
  deskripsi: string;
}[] = [
  {
    kunci: "pimpinan",
    label: "Pimpinan (Kepala Balai)",
    deskripsi:
      "Menerima agenda dinas, notifikasi instan WhatsApp, dan tombol konfirmasi kehadiran.",
  },
  {
    kunci: "pemantau",
    label: "Pemantau (Ajudan Kepala)",
    deskripsi:
      "Memantau seluruh agenda pimpinan dan menerima notifikasi eskalasi pengingat.",
  },
  {
    kunci: "operator",
    label: "Operator (Staf Humas/TU)",
    deskripsi:
      "Menginput surat masuk, membuat agenda kegiatan, dan mengunggah dokumen dinas.",
  },
  {
    kunci: "superadmin",
    label: "Super Admin",
    deskripsi:
      "Akses kendali penuh terhadap seluruh sistem, pengaturan, dan manajemen pengguna.",
  },
  {
    kunci: "pegawai",
    label: "Pegawai",
    deskripsi: "Melihat daftar kegiatan agenda dinas terbuka di lingkungan Balai Bahasa.",
  },
];

export function PenggunaForm({
  mode,
  dataAwal,
  currentUserId,
}: {
  mode: "baru" | "edit";
  dataAwal?: PenggunaItem;
  currentUserId: string;
}) {
  const aksi = mode === "baru" ? simpanPenggunaBaru : perbaruiPengguna;
  const [state, formAction, isPending] = useActionState<
    FormPenggunaState | null,
    FormData
  >(aksi, null);

  const isDiriSendiri = dataAwal?.id === currentUserId;

  return (
    <form action={formAction} className="space-y-5 pb-8">
      {dataAwal && <input type="hidden" name="id" value={dataAwal.id} />}

      {/* Pesan Kesalahan Global */}
      {state?.errors?.form && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[13px] font-semibold text-red-700">
          {state.errors.form}
        </div>
      )}

      {/* 1. Nama Lengkap */}
      <div>
        <label
          htmlFor="fullName"
          className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-slate-800"
        >
          <User className="h-4 w-4 text-slate-400" />
          Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          defaultValue={dataAwal?.fullName ?? ""}
          placeholder="Contoh: Dr. Eva Krisna, M.Hum."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
        {state?.errors?.fullName && (
          <p className="mt-1 text-xs font-semibold text-red-600">
            {state.errors.fullName}
          </p>
        )}
      </div>

      {/* 2. Email Login */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-slate-800"
        >
          <Mail className="h-4 w-4 text-slate-400" />
          Alamat Email (Login) <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={dataAwal?.email ?? ""}
          placeholder="nama@balaibahasa.kemdikbud.go.id"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
        {state?.errors?.email && (
          <p className="mt-1 text-xs font-semibold text-red-600">
            {state.errors.email}
          </p>
        )}
      </div>

      {/* 3. Kata Sandi */}
      <div>
        <label
          htmlFor={mode === "baru" ? "password" : "newPassword"}
          className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-slate-800"
        >
          <KeyRound className="h-4 w-4 text-slate-400" />
          {mode === "baru" ? (
            <>
              Kata Sandi Awal <span className="text-red-500">*</span>
            </>
          ) : (
            <>Ganti Kata Sandi (Opsional)</>
          )}
        </label>
        <input
          id={mode === "baru" ? "password" : "newPassword"}
          name={mode === "baru" ? "password" : "newPassword"}
          type="password"
          required={mode === "baru"}
          placeholder={
            mode === "baru"
              ? "Minimal 6 karakter"
              : "Kosongkan bila tidak ingin mengubah kata sandi"
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
        {state?.errors?.password && (
          <p className="mt-1 text-xs font-semibold text-red-600">
            {state.errors.password}
          </p>
        )}
        {state?.errors?.newPassword && (
          <p className="mt-1 text-xs font-semibold text-red-600">
            {state.errors.newPassword}
          </p>
        )}
      </div>

      {/* 4. Nomor WhatsApp */}
      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-slate-800"
        >
          <Phone className="h-4 w-4 text-slate-400" />
          Nomor WhatsApp <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={dataAwal?.phone ?? ""}
          placeholder="08123456789 atau 628123456789"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
        <p className="mt-1 text-[11.5px] text-slate-500">
          Nomor ini digunakan untuk pengiriman notifikasi instan pesan agenda via WhatsApp Fonnte.
        </p>
        {state?.errors?.phone && (
          <p className="mt-1 text-xs font-semibold text-red-600">
            {state.errors.phone}
          </p>
        )}
      </div>

      {/* 5. Peran / Role */}
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-slate-800">
          <Shield className="h-4 w-4 text-slate-400" />
          Hak Akses &amp; Peran <span className="text-red-500">*</span>
        </label>

        {isDiriSendiri && (
          <p className="mb-2 rounded-xl bg-amber-50 p-2.5 text-xs font-semibold text-amber-700">
            Anda sedang mengedit akun sendiri. Peran Super Admin dikunci agar tidak terkunci keluar dari sistem.
          </p>
        )}

        <div className="space-y-2">
          {DAFTAR_ROLE.map((r) => {
            const terpilih = (dataAwal?.role ?? "operator") === r.kunci;
            const disabled = isDiriSendiri && r.kunci !== "superadmin";

            return (
              <label
                key={r.kunci}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                  disabled
                    ? "cursor-not-allowed opacity-50 bg-slate-50 border-slate-200"
                    : "hover:border-brand-primary/40 has-checked:border-brand-primary has-checked:bg-brand-mint/40"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.kunci}
                  defaultChecked={terpilih}
                  disabled={disabled}
                  className="mt-1 h-4 w-4 accent-brand-primary"
                />
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-slate-900">
                    {r.label}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-slate-500">
                    {r.deskripsi}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
        {state?.errors?.role && (
          <p className="mt-1 text-xs font-semibold text-red-600">
            {state.errors.role}
          </p>
        )}
      </div>

      {/* 6. Status Akun Aktif */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <div>
            <p className="text-[14px] font-bold text-slate-900">
              Status Akun Aktif
            </p>
            <p className="text-[12px] text-slate-500">
              Pengguna yang dinonaktifkan tidak dapat login ke aplikasi SIPAP.
            </p>
          </div>
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={dataAwal ? dataAwal.isActive : true}
            disabled={isDiriSendiri}
            className="h-5 w-5 rounded border-slate-300 accent-brand-primary"
          />
        </label>
        {state?.errors?.isActive && (
          <p className="mt-1.5 text-xs font-semibold text-red-600">
            {state.errors.isActive}
          </p>
        )}
      </div>

      {/* Tombol Simpan */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-primary py-3.5 text-[15px] font-bold text-white transition-all hover:bg-brand-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>Menyimpan...</>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {mode === "baru" ? "Buat Pengguna Baru" : "Simpan Perubahan"}
            </>
          )}
        </button>

        <Link
          href="/admin/pengguna"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-[14px] font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Batal
        </Link>
      </div>
    </form>
  );
}
