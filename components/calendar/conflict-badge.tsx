import { AlertTriangle } from "lucide-react";
import { formatRentangJam, formatTanggalSingkat } from "@/lib/date";

interface Bentrok {
  id: number;
  perihal: string;
  waktuMulai: string;
  waktuSelesai: string;
}

export function ConflictBadge({ bentrok }: { bentrok: Bentrok[] }) {
  if (bentrok.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50/70 p-3.5"
    >
      <div className="flex items-center gap-2 text-[13px] font-semibold text-red-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Jadwal bentrok dengan {bentrok.length} agenda
      </div>
      <ul className="mt-2 space-y-1.5 border-t border-red-100 pt-2">
        {bentrok.map((a) => (
          <li key={a.id} className="text-[12.5px] leading-snug text-red-900">
            <span className="font-medium">{a.perihal}</span>
            <br />
            <span className="text-[11.5px] font-semibold tabular-nums text-red-700">
              {formatTanggalSingkat(a.waktuMulai)} ·{" "}
              {formatRentangJam(a.waktuMulai, a.waktuSelesai)} WIB
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
