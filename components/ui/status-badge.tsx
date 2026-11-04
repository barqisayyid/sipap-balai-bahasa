import { CheckCircle2, Clock, CornerUpRight, XCircle } from "lucide-react";
import type { StatusAgenda } from "@/lib/types";
import { STATUS_STYLE } from "@/lib/status";

const IKON = {
  Hadir: CheckCircle2,
  "Menunggu Konfirmasi": Clock,
  Didisposisikan: CornerUpRight,
  Batal: XCircle,
} as const;

export function StatusBadge({ status }: { status: StatusAgenda }) {
  const Ikon = IKON[status];
  return (
    <span
      className={`inline-flex max-w-[112px] shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-tight ${STATUS_STYLE[status].badge}`}
    >
      <Ikon className="h-3.5 w-3.5 shrink-0" />
      <span>{status}</span>
    </span>
  );
}
  