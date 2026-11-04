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
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-tight whitespace-nowrap shadow-xs ${info.badgeCls}`}
    >
      {info.ikon === "live-dot" ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      ) : info.ikon === "CheckCheck" ? (
        <CheckCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
      ) : info.ikon === "Clock" ? (
        <Clock className="h-3.5 w-3.5 shrink-0" />
      ) : info.ikon === "CornerUpRight" ? (
        <CornerUpRight className="h-3.5 w-3.5 shrink-0" />
      ) : info.ikon === "XCircle" ? (
        <XCircle className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
      )}
      <span>{teks}</span>
    </span>
  );
}
