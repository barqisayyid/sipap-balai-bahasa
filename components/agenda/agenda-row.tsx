import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Agenda } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatJam } from "@/lib/date";

export function AgendaRow({ agenda }: { agenda: Agenda }) {
  return (
    <Link
      href={`/agenda/${agenda.id}`}
      className="group flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-slate-50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="w-[52px] shrink-0 text-[11px] font-semibold leading-[14px] text-slate-400">
          {formatJam(agenda.waktuMulai)}
          <br />
          <span className="text-slate-500">– {formatJam(agenda.waktuSelesai)}</span>
        </div>
        <div className="h-8 w-px shrink-0 bg-slate-200" />
        <div className="min-w-0 pr-1">
          <h4 className="line-clamp-1 text-[13px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-primary">
            {agenda.perihal}
          </h4>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{agenda.lokasi}</span>
          </div>
        </div>
      </div>
      <StatusBadge
        status={agenda.status}
        waktuMulai={agenda.waktuMulai}
        waktuSelesai={agenda.waktuSelesai}
      />
    </Link>
  );
}
