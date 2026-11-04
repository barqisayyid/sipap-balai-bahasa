import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Agenda } from "@/lib/types";
import { STATUS_STYLE } from "@/lib/status";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatJam } from "@/lib/date";

export function AgendaRow({ agenda }: { agenda: Agenda }) {
  const gaya = STATUS_STYLE[agenda.status];

  return (
    <Link
      href={`/agenda/${agenda.id}`}
      className="flex items-start justify-between gap-2 py-1"
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="w-[48px] shrink-0 pt-0.5 text-[11px] font-medium leading-[14px] text-slate-400">
          {formatJam(agenda.waktuMulai)}
          <br />– {formatJam(agenda.waktuSelesai)}
        </div>
        <div
          className={`mt-0.5 h-10 w-[3.5px] shrink-0 rounded-full ${gaya.accent}`}
        />
        <div className="min-w-0 pr-1">
          <h4 className="line-clamp-2 text-[13px] font-bold leading-snug text-slate-900">
            {agenda.perihal}
          </h4>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{agenda.lokasi}</span>
          </div>
        </div>
      </div>
      <StatusBadge status={agenda.status} />
    </Link>
  );
}
