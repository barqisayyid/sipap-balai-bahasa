"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  MapPin,
  MessageSquare,
  X,
} from "lucide-react";
import { formatRentangJam, formatTanggalPanjang } from "@/lib/date";
import type { Role } from "@/lib/types";

export interface ItemNotifikasiAgenda {
  id: number;
  perihal: string;
  waktuMulai: string;
  waktuSelesai: string;
  lokasi: string;
}

interface NotifikasiBellProps {
  items: ItemNotifikasiAgenda[];
  role?: Role;
}

export function NotifikasiBell({ items, role }: NotifikasiBellProps) {
  const [buka, setBuka] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const jumlah = items.length;

  // Tutup jika klik di luar atau tekan tombol Escape
  useEffect(() => {
    function handleKlikLuar(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setBuka(false);
      }
    }
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") setBuka(false);
    }

    if (buka) {
      document.addEventListener("mousedown", handleKlikLuar);
      document.addEventListener("keydown", handleKeydown);
    }
    return () => {
      document.removeEventListener("mousedown", handleKlikLuar);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [buka]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setBuka(!buka)}
        aria-label={`Notifikasi (${jumlah} perlu konfirmasi)`}
        aria-expanded={buka}
        className={`relative rounded-full p-2 transition-all duration-200 active:scale-95 ${
          buka
            ? "bg-slate-200/80 text-brand-primary"
            : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        <Bell className="h-6 w-6" strokeWidth={1.8} />

        {/* Badge Dinamis: hanya tampil jika ada agenda yang menunggu tanggapan */}
        {jumlah > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
            {jumlah > 9 ? "9+" : jumlah}
          </span>
        )}
      </button>

      {/* Popover / Tray Dropdown */}
      {buka && (
        <>
          {/* Backdrop transparan untuk klik luar di mobile */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/10 sm:hidden"
            onClick={() => setBuka(false)}
          />

          <div
            className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[350px] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] sm:w-[370px]"
            style={{
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
          >
            {/* Header Tray */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-brand-primary">
                  <BellRing className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-900">
                    Pemberitahuan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Status agenda &amp; koordinasi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {jumlah > 0 ? (
                  <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                    {jumlah} Menunggu
                  </span>
                ) : (
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    Semua Beres
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setBuka(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Konten Tray */}
            <div className="mt-3 space-y-2.5">
              {jumlah === 0 ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h4 className="text-[13.5px] font-semibold text-slate-800">
                    Tidak Ada Agenda Tertunda
                  </h4>
                  <p className="mt-1 text-[11.5px] text-slate-500">
                    Seluruh agenda kedinasan telah terkonfirmasi.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-1 text-[12px] font-semibold text-slate-500">
                    <span>Perlu Konfirmasi ({jumlah})</span>
                    <Link
                      href="/agenda/antrean-konfirmasi"
                      onClick={() => setBuka(false)}
                      className="text-brand-primary hover:underline text-[11.5px]"
                    >
                      Buka Semua →
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {items.slice(0, 3).map((item) => (
                      <Link
                        key={item.id}
                        href={`/agenda/${item.id}`}
                        onClick={() => setBuka(false)}
                        className="group flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[13px] font-semibold leading-snug text-slate-900 group-hover:text-brand-primary">
                            {item.perihal}
                          </p>
                          <span className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                            Menunggu
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <CalendarDays className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>
                            {formatTanggalPanjang(item.waktuMulai)} •{" "}
                            {formatRentangJam(
                              item.waktuMulai,
                              item.waktuSelesai,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.lokasi}</span>
                        </div>
                      </Link>
                    ))}

                    {jumlah > 3 && (
                      <p className="py-1 text-center text-[11px] font-medium text-slate-400">
                        +{jumlah - 3} agenda menunggu lainnya
                      </p>
                    )}
                  </div>

                  <Link
                    href="/agenda/antrean-konfirmasi"
                    onClick={() => setBuka(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-primary py-2.5 text-[13px] font-semibold text-white shadow-xs transition-colors hover:bg-brand-dark"
                  >
                    <span>Tanggapi di Antrean Konfirmasi</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </>
              )}

              {/* Tautan Khusus Super Admin */}
              {role === "superadmin" && (
                <div className="border-t border-slate-100 pt-2.5">
                  <Link
                    href="/admin/log-notifikasi"
                    onClick={() => setBuka(false)}
                    className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-primary"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-brand-primary" />
                      <span>Log Gateway WhatsApp (Fonnte)</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
