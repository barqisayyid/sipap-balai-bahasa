"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Kembali"
      onClick={() =>
        window.history.length > 1 ? router.back() : router.push(fallback)
      }
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
}
