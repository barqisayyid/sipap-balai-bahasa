import Link from "next/link";
import { Clock, Landmark, MapPin, Users } from "lucide-react";
import type { Agenda } from "@/lib/types";
import { STATUS_STYLE } from "@/lib/status";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  dateKeyWIB,
  formatRentangJam,
  formatTanggalSingkat,
  getNow,
} from "@/lib/date";

export function AgendaCard({
  agenda,
  tampilTanggal = true,
}: {
  agenda: Agenda;
  tampilTanggal?: boolean;
}) {
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
    <Link
      href={`/agenda/${agenda.id}`}
      className="relative flex overflow-hidden rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-transform active:scale-[0.99]"
    >
      <div
        className={`absolute inset-y-0 left-0 w-1.5 rounded-r ${gaya.accent}`}
      />
      <div className="flex w-full flex-col gap-2 pl-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${gaya.iconBox}`}
            >
              <Ikon className="h-6 w-6" />
            </div>
            <h4 className="pt-0.5 text-[14.5px] font-bold leading-snug text-slate-900">
              {agenda.perihal}
            </h4>
          </div>
          <StatusBadge status={agenda.status} />
        </div>

        <div className="space-y-1 pl-14 text-[12.5px] font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{teksWaktu}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{agenda.lokasi}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
