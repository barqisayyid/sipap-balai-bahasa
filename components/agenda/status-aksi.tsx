"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { ubahStatus } from "@/lib/actions/status";
import type { StatusAgenda } from "@/lib/types";

const OPSI: Record<
  StatusAgenda,
  { label: string; cls: string; konfirmasi?: string }
> = {
  Hadir: {
    label: "Tandai Hadir",
    cls: "bg-brand-primary text-white hover:bg-brand-dark",
  },
  Didisposisikan: {
    label: "Disposisikan",
    cls: "border border-sky-300 text-sky-700 hover:bg-sky-50",
  },
  "Menunggu Konfirmasi": {
    label: "Kembalikan ke Menunggu",
    cls: "border border-slate-300 text-slate-600 hover:bg-slate-50",
  },
  Batal: {
    label: "Batalkan Agenda",
    cls: "border border-red-300 text-red-600 hover:bg-red-50",
    konfirmasi:
      "Batalkan agenda ini? Agenda tidak akan tampil lagi di kalender.",
  },
};

export function StatusAksi({
  agendaId,
  pilihan,
}: {
  agendaId: number;
  pilihan: StatusAgenda[];
}) {
  const [pending, startTransition] = useTransition();
  const [aktif, setAktif] = useState<StatusAgenda | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pilih(status: StatusAgenda) {
    const o = OPSI[status];
    if (o.konfirmasi && !window.confirm(o.konfirmasi)) return;
    setError(null);
    setAktif(status);
    startTransition(async () => {
      const hasil = await ubahStatus(agendaId, status);
      if (hasil.error) setError(hasil.error);
    });
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {pilihan.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => pilih(s)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13.5px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 ${OPSI[s].cls}`}
          >
            {pending && aktif === s && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {OPSI[s].label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
