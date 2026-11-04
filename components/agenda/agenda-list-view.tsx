"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, CalendarSearch } from "lucide-react";
import { AgendaCard } from "@/components/agenda/agenda-card";
import { dateKeyWIB, formatTanggalPanjang } from "@/lib/date";
import type { Agenda } from "@/lib/types";
import type { FilterAgenda } from "@/lib/data/agenda";

const FILTER: { kunci: FilterAgenda; label: string }[] = [
  { kunci: "mendatang", label: "Mendatang" },
  { kunci: "menunggu", label: "Belum Konfirmasi" },
  { kunci: "semua", label: "Semua" },
];

const PESAN_KOSONG: Record<FilterAgenda, string> = {
  mendatang: "Belum ada agenda mendatang.",
  menunggu: "Semua agenda sudah terkonfirmasi. 🎉",
  semua: "Belum ada agenda sama sekali.",
};

interface AgendaListViewProps {
  daftarAwal: Agenda[];
  filterAktif: FilterAgenda;
  hariIniKey: string;
  bolehKelola: boolean;
}

export function AgendaListView({
  daftarAwal,
  filterAktif,
  hariIniKey,
  bolehKelola,
}: AgendaListViewProps) {
  const [query, setQuery] = useState("");

  // Filter pencarian live berdasarkan perihal, tempat, pengirim, nomor surat, catatan, pendamping
  const hasil = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return daftarAwal;
    return daftarAwal.filter((a) => {
      const matchPerihal = a.perihal.toLowerCase().includes(q);
      const matchLokasi = a.lokasi.toLowerCase().includes(q);
      const matchPengirim =
        a.pengirim && a.pengirim.toLowerCase().includes(q);
      const matchNomorSurat =
        a.nomorSurat && a.nomorSurat.toLowerCase().includes(q);
      const matchPendamping =
        a.pendamping && a.pendamping.toLowerCase().includes(q);
      const matchCatatan = a.catatan && a.catatan.toLowerCase().includes(q);

      return (
        matchPerihal ||
        matchLokasi ||
        matchPengirim ||
        matchNomorSurat ||
        matchPendamping ||
        matchCatatan
      );
    });
  }, [daftarAwal, query]);

  // Kelompokkan per tanggal
  const kelompok = useMemo(() => {
    const map = new Map<string, Agenda[]>();
    for (const a of hasil) {
      const k = dateKeyWIB(a.waktuMulai);
      map.set(k, [...(map.get(k) ?? []), a]);
    }
    return map;
  }, [hasil]);

  const sedangMencari = query.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Kotak Pencarian Live */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari perihal, lokasi, pengundang..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-[14px] text-slate-800 placeholder:text-slate-400 shadow-xs transition-all focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
        {sedangMencari && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Tab */}
      <nav
        className="flex items-center gap-2 overflow-x-auto pb-1"
        aria-label="Filter"
      >
        {FILTER.map((f) => {
          const on = f.kunci === filterAktif;
          return (
            <Link
              key={f.kunci}
              href={`/agenda?filter=${f.kunci}`}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
                on
                  ? "border-brand-primary bg-brand-primary text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </Link>
          );
        })}

        {sedangMencari && (
          <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11.5px] font-semibold text-slate-600">
            {hasil.length} hasil
          </span>
        )}
      </nav>

      {/* Konten Daftar Agenda */}
      {daftarAwal.length === 0 ? (
        <p className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow-sm">
          {PESAN_KOSONG[filterAktif]}
        </p>
      ) : hasil.length === 0 ? (
        /* Kondisi pencarian tidak ada hasil */
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <CalendarSearch className="h-6 w-6" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-800">
            Agenda Tidak Ditemukan
          </h3>
          <p className="mt-1 text-[13px] text-slate-500">
            Tidak ada agenda yang cocok dengan kata kunci &ldquo;
            <span className="font-semibold text-slate-700">{query}</span>&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <X className="h-3.5 w-3.5" />
            Hapus Pencarian
          </button>
        </div>
      ) : (
        <div className="space-y-6 pt-1">
          {[...kelompok.entries()].map(([key, items]) => (
            <section key={key}>
              <h2 className="mb-2.5 px-1 text-[13px] font-bold text-slate-500">
                {key === hariIniKey && (
                  <span className="mr-1.5 rounded-full bg-brand-mint px-2 py-0.5 text-[11px] text-brand-primary">
                    Hari Ini
                  </span>
                )}
                {formatTanggalPanjang(new Date(`${key}T12:00:00+07:00`))}
              </h2>
              <div className="space-y-3">
                {items.map((a) => (
                  <AgendaCard
                    key={a.id}
                    agenda={a}
                    tampilTanggal={false}
                    bolehKelola={bolehKelola}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
