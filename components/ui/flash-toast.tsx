"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface FlashToastProps {
  message: string;
  duration?: number;
}

export function FlashToast({ message, duration = 3200 }: FlashToastProps) {
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // 1. Trigger animasi masuk di frame berikutnya
    const enterTimer = requestAnimationFrame(() => {
      setAnimating(true);
    });

    // 2. Bersihkan query params (?edit=1 atau ?baru=1) dari address bar peramban seketika
    // sehingga saat pengguna merefresh halaman, toast TIDAK akan muncul lagi.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("edit") || url.searchParams.has("baru")) {
        url.searchParams.delete("edit");
        url.searchParams.delete("baru");
        const cleanUrl = url.pathname + (url.search ? url.search : "");
        window.history.replaceState(null, "", cleanUrl);
      }
    }

    // 3. Timer otomatis keluar setelah durasi yang nyaman
    const timer = setTimeout(() => {
      setAnimating(false);
      setTimeout(() => setVisible(false), 300);
    }, duration);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(timer);
    };
  }, [duration]);

  if (!visible) return null;

  const handleDismiss = () => {
    setAnimating(false);
    setTimeout(() => setVisible(false), 300);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 inset-x-0 mx-auto z-50 w-[calc(100%-2rem)] max-w-[398px] transition-all duration-300 ease-out ${
        animating
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-3 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-700/60 bg-emerald-950/95 px-3.5 py-2.5 text-white shadow-xl shadow-black/15 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="truncate text-[13px] font-medium text-emerald-50">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Tutup notifikasi"
          className="shrink-0 rounded-lg p-1 text-emerald-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
