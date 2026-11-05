"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { Agenda } from "@/lib/types";
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

  // Jika bukan hari ini, tampilkan tanggalnya di depan jam
  const bukanHariIni =
    tampilTanggal && dateKeyWIB(agenda.waktuMulai) !== dateKeyWIB(getNow());
  const teksWaktu =
    (bukanHariIni ? `${formatTanggalSingkat(agenda.waktuMulai)} · ` : "") +
    formatRentangJam(agenda.waktuMulai, agenda.waktuSelesai);

  return (
    <div
      className={`group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-colors hover:border-slate-300 hover:shadow-sm ${
        menuBuka ? "z-30" : "z-0"
      }`}
    >
      {/* Baris Atas: Waktu + Status + Menu Titik Tiga */}
      <div className="flex items-center justify-between gap-2 pb-2.5">
        <Link
          href={`/agenda/${agenda.id}`}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:text-slate-800"
        >
          <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{teksWaktu}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <StatusBadge
            status={agenda.status}
            waktuMulai={agenda.waktuMulai}
            waktuSelesai={agenda.waktuSelesai}
          />
          <AgendaMenu
            agenda={agenda}
            bolehKelola={bolehKelola}
            variant="compact"
            onOpenChange={setMenuBuka}
          />
        </div>
      </div>

      {/* Konten Utama: Perihal & Lokasi */}
      <Link href={`/agenda/${agenda.id}`} className="block space-y-1.5 pt-0.5">
        <h3 className="text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-primary line-clamp-2">
          {agenda.perihal}
        </h3>

        <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate text-slate-600">{agenda.lokasi}</span>
          {agenda.pengirim && (
            <>
              <span className="text-slate-300">·</span>
              <span className="truncate text-slate-400">{agenda.pengirim}</span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
