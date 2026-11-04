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
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all hover:bg-white active:scale-95"
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
    </button>
  );
}
