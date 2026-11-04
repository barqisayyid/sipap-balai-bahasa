"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Landmark, MapPin, Users } from "lucide-react";
import type { Agenda } from "@/lib/types";
import { STATUS_STYLE } from "@/lib/status";
import { StatusBadge } from "@/components/ui/status-badge";
import { AgendaMenu } from "@/components/agenda/agenda-menu";
import {
  dateKeyWIB,
  formatRentangJam,
  formatTanggalSingkat,
  getNow,
} from "@/lib/date";

export function AgendaCard({
  agenda,
  tampilTanggal = true,
  bolehKelola = false,
}: {
  agenda: Agenda;
  tampilTanggal?: boolean;
  bolehKelola?: boolean;
}) {
  const [menuBuka, setMenuBuka] = useState(false);
  const gaya = STATUS_STYLE[agenda.status];
  const Ikon = agenda.perihal.toLowerCase().startsWith("rapat")
    ? Landmark
    : Users;

  // Jika bukan hari ini, tampilkan tanggalnya di depan jam
  const bukanHariIni =
    tampilTanggal && dateKeyWIB(agenda.waktuMulai) !== dateKeyWIB(getNow());
  const teksWaktu =
    (bukanHariIni ? `${formatTanggalSingkat(agenda.waktuMulai)} · ` : "") +
    formatRentangJam(agenda.waktuMulai, agenda.waktuSelesai);

  return (
    <div
      className={`group relative flex rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] active:scale-[0.995] ${
        menuBuka ? "z-30" : "z-0"
      }`}
    >
      {/* Indikator vertikal di kiri */}
      <div
        className={`absolute inset-y-0 left-0 w-1.5 rounded-l-[22px] ${gaya.accent}`}
      />

      <div className="flex w-full flex-col gap-2 pl-2">
        {/* Baris Atas: Ikon + Judul + Titik Tiga di Sudut Kanan Atas Box */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/agenda/${agenda.id}`}
            className="flex min-w-0 flex-1 items-start gap-3"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${gaya.iconBox}`}
            >
              <Ikon className="h-6 w-6" />
            </div>
            <h4 className="pt-0.5 text-[14.5px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-primary">
              {agenda.perihal}
            </h4>
          </Link>

          {/* Tombol Titik Tiga di Sudut Kanan Atas Box */}
          <div className="relative -mr-1 -mt-1 shrink-0">
            <AgendaMenu
              agenda={agenda}
              bolehKelola={bolehKelola}
              variant="compact"
              onOpenChange={setMenuBuka}
            />
          </div>
        </div>

        {/* Informasi Waktu & Lokasi Sejajar dengan Badge Status di Bawah */}
        <div className="pl-14 text-[12.5px] font-medium text-slate-500">
          <Link href={`/agenda/${agenda.id}`} className="block space-y-1.5">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{teksWaktu}</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate text-slate-600">{agenda.lokasi}</span>
              </div>

              {/* Badge Hadir / Disposisi pindah ke bawah sejajar dengan Tempat */}
              <div className="shrink-0">
                <StatusBadge status={agenda.status} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
