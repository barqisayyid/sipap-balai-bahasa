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
      className={`group relative rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition-colors hover:border-slate-300 ${
        menuBuka ? "z-30" : "z-0"
      }`}
    >
      {/* Baris Atas: Waktu + Status + Menu Titik Tiga */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <Link
          href={`/agenda/${agenda.id}`}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span className="truncate tabular-nums font-semibold">{teksWaktu}</span>
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
        <h3 className="text-[14.5px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-brand-primary line-clamp-2 [text-wrap:pretty]">
          {agenda.perihal}
        </h3>

        <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span className="truncate text-slate-700">{agenda.lokasi}</span>
          {agenda.pengirim && (
            <>
              <span className="text-slate-400">·</span>
              <span className="truncate text-slate-500">{agenda.pengirim}</span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
