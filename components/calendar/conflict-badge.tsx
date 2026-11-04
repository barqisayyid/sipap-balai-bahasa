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
      className="rounded-2xl border border-red-200 bg-red-50 p-4"
    >
      <div className="flex items-center gap-2 text-sm font-bold text-red-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Jadwal bentrok dengan {bentrok.length} agenda
      </div>
      <ul className="mt-2 space-y-2">
        {bentrok.map((a) => (
          <li key={a.id} className="text-[13px] leading-snug text-red-800">
            <span className="font-semibold">{a.perihal}</span>
            <br />
            <span className="text-red-600">
              {formatTanggalSingkat(a.waktuMulai)} ·{" "}
              {formatRentangJam(a.waktuMulai, a.waktuSelesai)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
