import {
  CheckCheck,
  CheckCircle2,
  Clock,
  CornerUpRight,
  XCircle,
} from "lucide-react";
import type { StatusAgenda } from "@/lib/types";
import { getInfoStatusLifecycle } from "@/lib/status";

export function StatusBadge({
  status,
  waktuMulai,
  waktuSelesai,
  varian = "ringkas",
}: {
  status: StatusAgenda;
  waktuMulai?: string;
  waktuSelesai?: string;
  varian?: "ringkas" | "lengkap";
}) {
  const info = getInfoStatusLifecycle(status, waktuMulai, waktuSelesai);
  const teks = varian === "lengkap" ? info.labelLengkap : info.labelRingkas;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-normal whitespace-nowrap ${info.badgeCls}`}
    >
      {info.ikon === "live-dot" ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
      ) : info.ikon === "CheckCheck" ? (
        <CheckCheck className="h-3 w-3 shrink-0" strokeWidth={2.2} />
      ) : info.ikon === "Clock" ? (
        <Clock className="h-3 w-3 shrink-0" strokeWidth={1.8} />
      ) : info.ikon === "CornerUpRight" ? (
        <CornerUpRight className="h-3 w-3 shrink-0" strokeWidth={1.8} />
      ) : info.ikon === "XCircle" ? (
        <XCircle className="h-3 w-3 shrink-0" strokeWidth={1.8} />
      ) : (
        <CheckCircle2 className="h-3 w-3 shrink-0" strokeWidth={1.8} />
      )}
      <span>{teks}</span>
    </span>
  );
}
