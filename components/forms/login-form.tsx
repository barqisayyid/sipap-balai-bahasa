"use client";

import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
} from "react";
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldAlert, X } from "lucide-react";
import { masuk } from "@/lib/actions/auth";

export function LoginForm({ pesanAwal }: { pesanAwal?: string }) {
  const [state, formAction, pending] = useActionState(masuk, null);
  const [showPassword, setShowPassword] = useState(false);
  const [bukaBantuan, setBukaBantuan] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  const pesan = state?.error ?? pesanAwal;

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email-input"
            className="mb-1.5 block text-[13px] font-semibold text-slate-800"
          >
            Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="email-input"
              type="email"
              name="email"
              required
              autoComplete="username"
              placeholder="emailanda@mail.com"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-[14px] text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#0A5C36] focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/15"
            />
          </div>
        </div>

        {/* Kata Sandi */}
        <div>
          <label
            htmlFor="password-input"
            className="mb-1.5 block text-[13px] font-semibold text-slate-800"
          >
            Kata Sandi
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-[14px] text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#0A5C36] focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Ingat Saya & Bantuan Lupa Kata Sandi */}
        <div className="flex items-center justify-between pt-1 text-[13px]">
          <label className="flex cursor-pointer items-center gap-2 select-none text-slate-600 hover:text-slate-800">
            <input
              type="checkbox"
              name="remember"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 text-[#0A5C36] accent-[#0A5C36] focus:ring-[#0A5C36]/20"
            />
            <span>Ingat saya</span>
          </label>

          <button
            type="button"
            onClick={() => setBukaBantuan(true)}
            className="font-medium text-[#0A5C36] transition-colors hover:text-[#074728] hover:underline"
          >
            Lupa kata sandi?
          </button>
        </div>

        {/* Pesan Kesalahan */}
        {pesan && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-[13px] text-red-700"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="font-medium leading-snug">{pesan}</p>
          </div>
        )}

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0A5C36] text-[15px] font-bold text-white shadow-md shadow-[#0A5C36]/20 transition-all hover:bg-[#074728] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Memeriksa..." : "Masuk"}
        </button>
      </form>

      {/* Dialog Modal Bantuan Lupa Kata Sandi Kedinasan */}
      {bukaBantuan && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-[#0A5C36]">
                  <Lock className="h-4 w-4" />
                </span>
                <h3 className="text-[16px] font-bold">Lupa Kata Sandi</h3>
              </div>
              <button
                type="button"
                onClick={() => setBukaBantuan(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Tutup dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3.5 space-y-2 text-[13px] leading-relaxed text-slate-600">
              <p>
                Demi menjaga keamanan data dan agenda pimpinan, pemulihan kata
                sandi akun kedinasan SIPAP dikelola secara terpusat.
              </p>
              <div className="rounded-xl bg-slate-50 p-3 text-[12px] text-slate-700">
                <p className="font-semibold text-slate-900">
                  Langkah Pemulihan:
                </p>
                <p className="mt-1">
                  Silakan hubungi <strong>Subbagian Tata Usaha</strong> atau{" "}
                  <strong>Administrator SIPAP</strong> Balai Bahasa Provinsi
                  Sumatera Barat untuk memperbarui kata sandi Anda.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBukaBantuan(false)}
              className="mt-5 w-full rounded-full bg-[#0A5C36] py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#074728]"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
