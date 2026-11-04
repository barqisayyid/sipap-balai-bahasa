"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { hapusLampiran } from "@/lib/actions/lampiran";

export function HapusSurat({ id, nama }: { id: number; nama: string }) {
  const [pending, startTransition] = useTransition();

  function onHapus() {
    if (!window.confirm(`Hapus berkas "${nama}"?`)) return;
    startTransition(async () => {
      const hasil = await hapusLampiran(id);
      if (hasil.error) window.alert(hasil.error);
    });
  }

  return (
    <button
      type="button"
      onClick={onHapus}
      disabled={pending}
      aria-label={`Hapus ${nama}`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
