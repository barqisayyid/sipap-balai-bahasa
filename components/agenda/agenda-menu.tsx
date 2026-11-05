"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  Check,
  Copy,
  Edit3,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { hapusAgenda } from "@/lib/actions/agenda";
import { formatRentangJam, formatTanggalPanjang } from "@/lib/date";
import type { Agenda } from "@/lib/types";

interface AgendaMenuProps {
  agenda: Agenda;
  bolehKelola: boolean;
  variant?: "detail" | "compact";
  onOpenChange?: (open: boolean) => void;
}

export function AgendaMenu({
  agenda,
  bolehKelola,
  variant = "detail",
  onOpenChange,
}: AgendaMenuProps) {
  const router = useRouter();
  const [buka, setBuka] = useState(false);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [tersalin, setTersalin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleSetBuka = useCallback(
    (nilai: boolean) => {
      setBuka(nilai);
      onOpenChange?.(nilai);
    },
    [onOpenChange],
  );

  // Tutup menu jika klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleSetBuka(false);
      }
    }
    if (buka) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [buka, handleSetBuka]);

  // Salin ringkasan agenda ke clipboard (format WhatsApp)
  async function handleSalin() {
    const teks = [
      "🏛️ *AGENDA KEDINASAN KEPALA BALAI*",
      "*Balai Bahasa Provinsi Sumatera Barat*",
      "",
      `📋 *Kegiatan:* ${agenda.perihal}`,
      agenda.pengirim ? `🏢 *Penyelenggara:* ${agenda.pengirim}` : null,
      `📅 *Waktu:* ${formatTanggalPanjang(agenda.waktuMulai)} | ${formatRentangJam(agenda.waktuMulai, agenda.waktuSelesai)}`,
      `📍 *Tempat:* ${agenda.lokasi}`,
      agenda.linkMaps ? `🗺️ *Peta:* ${agenda.linkMaps}` : null,
      agenda.pakaian ? `👔 *Pakaian:* ${agenda.pakaian}` : null,
      agenda.pendamping ? `👥 *Pendamping:* ${agenda.pendamping}` : null,
      agenda.catatan ? `📝 *Catatan:* ${agenda.catatan}` : null,
      `📌 *Status:* ${agenda.status}`,
    ]
      .filter((line) => line !== null)
      .join("\n");

    try {
      await navigator.clipboard.writeText(teks);
      setTersalin(true);
      setTimeout(() => {
        setTersalin(false);
        handleSetBuka(false);
      }, 1500);
    } catch {
      setPesanError("Gagal menyalin teks.");
    }
  }

  // Unduh berkas .ics standar kalender
  function handleUnduhICS() {
    const formatICSDate = (d: string) => {
      return new Date(d)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    };

    const deskripsi = [
      agenda.catatan ? `Catatan: ${agenda.catatan}` : "",
      agenda.pakaian ? `Pakaian: ${agenda.pakaian}` : "",
      agenda.pendamping ? `Pendamping: ${agenda.pendamping}` : "",
      agenda.pengirim ? `Pengirim: ${agenda.pengirim}` : "",
    ]
      .filter(Boolean)
      .join("\\n");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Balai Bahasa Sumbar//SIPAP//ID",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:sipap-${agenda.id}@balaibahasasumbar.kemdikbud.go.id`,
      `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
      `DTSTART:${formatICSDate(agenda.waktuMulai)}`,
      `DTEND:${formatICSDate(agenda.waktuSelesai)}`,
      `SUMMARY:${agenda.perihal}`,
      `LOCATION:${agenda.lokasi}`,
      `DESCRIPTION:${deskripsi}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Agenda-${agenda.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleSetBuka(false);
  }

  // Hapus agenda
  function handleHapus() {
    setPesanError(null);
    startTransition(async () => {
      const res = await hapusAgenda(agenda.id);
      if (res.ok) {
        setKonfirmasiHapus(false);
        handleSetBuka(false);
        router.push("/agenda");
      } else {
        setPesanError(res.error ?? "Gagal menghapus agenda");
      }
    });
  }

  return (
    <div
      className="relative"
      ref={menuRef}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSetBuka(!buka);
        }}
        aria-label="Pilihan lainnya"
        className={
          variant === "compact"
            ? "flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95"
            : "flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all hover:bg-white active:scale-95"
        }
      >
        <MoreHorizontal
          className={variant === "compact" ? "h-4 w-4" : "h-5 w-5"}
        />
      </button>

      {/* Menu dropdown */}
      {buka && (
        <>
          {/* Backdrop transparan untuk klik di luar */}
          <div
            className="fixed inset-0 z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSetBuka(false);
            }}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute right-0 z-30 w-56 rounded-3xl border border-slate-100 bg-white p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] animate-in fade-in zoom-in-95 duration-150 ${
              variant === "compact" ? "top-9" : "top-13"
            }`}
          >
            {bolehKelola && (
              <Link
                href={`/agenda/${agenda.id}/edit`}
                onClick={() => handleSetBuka(false)}
                className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-primary"
              >
                <Edit3 className="h-4 w-4 text-brand-primary" />
                Ubah Data Agenda
              </Link>
            )}

            <button
              type="button"
              onClick={handleSalin}
              className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-primary"
            >
              {tersalin ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin ke Klip!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-500" />
                  Salin Info Agenda
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleUnduhICS}
              className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-primary"
            >
              <CalendarPlus className="h-4 w-4 text-slate-500" />
              Simpan ke Kalender (.ics)
            </button>

            {bolehKelola && (
              <div className="mt-1 border-t border-slate-100 pt-1">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSetBuka(false);
                    setKonfirmasiHapus(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                  Hapus Agenda
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Dialog Konfirmasi Hapus */}
      {mounted &&
        konfirmasiHapus &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => {
              if (!isPending) setKonfirmasiHapus(false);
            }}
          >
            <div
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>

              <h3 className="text-center text-[17px] font-extrabold text-slate-900">
                Hapus Agenda Kedinasan?
              </h3>
              <p className="mt-2 text-center text-[13px] leading-relaxed text-slate-500">
                Apakah Anda yakin ingin menghapus agenda{" "}
                <span className="font-bold text-slate-800">
                  &ldquo;{agenda.perihal}&rdquo;
                </span>
                ? Agenda ini akan dibatalkan dan dihapus dari kalender.
              </p>

              {pesanError && (
                <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-center text-xs font-semibold text-red-600">
                  {pesanError}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setKonfirmasiHapus(false)}
                  className="rounded-2xl border border-slate-200 py-3 text-[14px] font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleHapus}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Ya, Hapus"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
