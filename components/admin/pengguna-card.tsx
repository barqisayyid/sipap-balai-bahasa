"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Edit3,
  Mail,
  MessageCircle,
  MoreVertical,
  Send,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import type { PenggunaItem, Role } from "@/lib/types";
import { LABEL_ROLE } from "@/lib/types";
import {
  alihkanStatusPengguna,
  hapusPengguna,
  kirimUlangInfoWA,
} from "@/lib/actions/pengguna";

const WARNA_ROLE: Record<
  Role,
  { badge: string; bgInitial: string; textInitial: string }
> = {
  superadmin: {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    bgInitial: "bg-purple-100",
    textInitial: "text-purple-700",
  },
  pimpinan: {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    bgInitial: "bg-emerald-100",
    textInitial: "text-emerald-800",
  },
  pemantau: {
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    bgInitial: "bg-amber-100",
    textInitial: "text-amber-800",
  },
  operator: {
    badge: "bg-sky-50 text-sky-800 border-sky-200",
    bgInitial: "bg-sky-100",
    textInitial: "text-sky-800",
  },
  pegawai: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    bgInitial: "bg-slate-200",
    textInitial: "text-slate-700",
  },
};

export function PenggunaCard({
  pengguna,
  currentUserId,
}: {
  pengguna: PenggunaItem;
  currentUserId: string;
}) {
  const [bukaMenu, setBukaMenu] = useState(false);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDiriSendiri = pengguna.id === currentUserId;
  const inisial = pengguna.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const warna = WARNA_ROLE[pengguna.role] ?? WARNA_ROLE.pegawai;

  function handleToggleStatus() {
    setPesanError(null);
    setPesanSukses(null);
    startTransition(async () => {
      const res = await alihkanStatusPengguna(
        pengguna.id,
        !pengguna.isActive,
      );
      if (!res.ok && res.error) {
        setPesanError(res.error);
      } else {
        setBukaMenu(false);
      }
    });
  }

  function handleKirimInfoWA() {
    setPesanError(null);
    setPesanSukses(null);
    startTransition(async () => {
      const res = await kirimUlangInfoWA(pengguna.id);
      if (res.ok) {
        setPesanSukses("Notifikasi WhatsApp berhasil dikirim ke nomor pengguna!");
        setBukaMenu(false);
      } else {
        setPesanError(res.message ?? "Gagal mengirim pesan WhatsApp");
      }
    });
  }

  function handleHapus() {
    setPesanError(null);
    setPesanSukses(null);
    startTransition(async () => {
      const res = await hapusPengguna(pengguna.id);
      if (!res.ok && res.error) {
        setPesanError(res.error);
      } else {
        setKonfirmasiHapus(false);
        setBukaMenu(false);
      }
    });
  }

  return (
    <div
      className={`relative rounded-3xl border bg-white p-4 shadow-sm transition-all ${
        pengguna.isActive
          ? "border-slate-100 hover:border-slate-200"
          : "border-slate-200/60 bg-slate-50/50 opacity-80"
      }`}
    >
      {pesanError && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-600">
          {pesanError}
        </div>
      )}

      {pesanSukses && (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700">
          {pesanSukses}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        {/* Avatar & Info Utama */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[16px] font-extrabold ${warna.bgInitial} ${warna.textInitial}`}
          >
            {inisial || "P"}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-[15px] font-bold text-slate-900">
                {pengguna.fullName}
              </h3>
              {isDiriSendiri && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Anda
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${warna.badge}`}
              >
                {LABEL_ROLE[pengguna.role]}
              </span>

              {pengguna.isActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Aktif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  Nonaktif
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu Aksi */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setBukaMenu((v) => !v)}
            aria-label="Menu aksi pengguna"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {bukaMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setBukaMenu(false)}
              />
              <div className="absolute right-0 top-9 z-30 w-48 rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl">
                <Link
                  href={`/admin/pengguna/${pengguna.id}`}
                  onClick={() => setBukaMenu(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Edit3 className="h-4 w-4 text-slate-400" />
                  Ubah Data
                </Link>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleKirimInfoWA}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-semibold text-brand-primary hover:bg-brand-mint/40 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 text-brand-primary" />
                  Kirim Info ke WA
                </button>

                {!isDiriSendiri && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleToggleStatus}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {pengguna.isActive ? (
                      <>
                        <UserX className="h-4 w-4 text-amber-500" />
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                        Aktifkan
                      </>
                    )}
                  </button>
                )}

                {!isDiriSendiri && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setBukaMenu(false);
                      setKonfirmasiHapus(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    Hapus Akun
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rincian Kontak */}
      <div className="mt-3.5 border-t border-slate-100 pt-3 text-[13px] text-slate-600">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{pengguna.email}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <a
              href={`https://wa.me/${pengguna.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-brand-primary hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span>+{pengguna.phone}</span>
            </a>

            <Link
              href={`/admin/pengguna/${pengguna.id}`}
              className="text-[12px] font-bold text-slate-400 hover:text-brand-primary"
            >
              Detail →
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Dialog Konfirmasi Hapus */}
      {mounted &&
        konfirmasiHapus &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => {
              if (!isPending) setKonfirmasiHapus(false);
            }}
          >
            <div
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <ShieldAlert className="h-6 w-6" />
              </div>

              <h4 className="text-[17px] font-extrabold text-slate-900">
                Hapus Akun Pengguna?
              </h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                Apakah Anda yakin ingin menghapus akun{" "}
                <b>{pengguna.fullName}</b> ({pengguna.email})? Tindakan ini tidak
                dapat dibatalkan.
              </p>

              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setKonfirmasiHapus(false)}
                  className="flex-1 rounded-full border border-slate-200 py-3 text-[14px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleHapus}
                  className="flex-1 rounded-full bg-red-600 py-3 text-[14px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
