"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function BackButton({
  fallback = "/",
  href,
  forceFallback = false,
}: {
  fallback?: string;
  href?: string;
  forceFallback?: boolean;
}) {
  const router = useRouter();

  const handleBack = () => {
    // 1. Jika eksplisit href ditentukan, arahkan langsung ke tujuan tersebut
    if (href) {
      router.push(href);
      return;
    }

    // 2. Jika forceFallback diaktifkan (misalnya setelah simpan edit/tambah baru)
    if (forceFallback) {
      router.push(fallback);
      return;
    }

    // 3. Deteksi cerdas: bila halaman sebelumnya adalah form edit/baru atau baru selesai diedit,
    // jangan kembalikan user ke form pengeditan melainkan langsung ke fallback (kalender/agenda)
    if (typeof window !== "undefined") {
      const isFromForm =
        document.referrer.includes("/edit") ||
        document.referrer.includes("/baru") ||
        window.location.search.includes("edit=") ||
        window.location.search.includes("baru=");
      if (isFromForm) {
        router.push(fallback);
        return;
      }
    }

    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      aria-label="Kembali"
      onClick={handleBack}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
}
