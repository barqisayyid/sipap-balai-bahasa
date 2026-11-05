"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { hapusLampiran } from "@/lib/actions/lampiran";

export function HapusSurat({ id, nama }: { id: number; nama: string }) {
  const [bukaKonfirmasi, setBukaKonfirmasi] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function onHapus() {
    setPesanError(null);
    startTransition(async () => {
      const hasil = await hapusLampiran(id);
      if (hasil.error) {
        setPesanError(hasil.error);
      } else {
        setBukaKonfirmasi(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setBukaKonfirmasi(true);
        }}
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

      {mounted &&
        bukaKonfirmasi &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => {
              if (!pending) setBukaKonfirmasi(false);
            }}
          >
            <div
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>

              <h3 className="text-center text-[17px] font-extrabold text-slate-900">
                Hapus Berkas Surat?
              </h3>
              <p className="mt-2 text-center text-[13px] leading-relaxed text-slate-500">
                Apakah Anda yakin ingin menghapus berkas{" "}
                <span className="font-bold text-slate-800">
                  &ldquo;{nama}&rdquo;
                </span>
                ? Berkas yang dihapus tidak dapat dipulihkan.
              </p>

              {pesanError && (
                <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-center text-xs font-semibold text-red-600">
                  {pesanError}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setBukaKonfirmasi(false)}
                  className="rounded-2xl border border-slate-200 py-3 text-[14px] font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={onHapus}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Ya, Hapus"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
