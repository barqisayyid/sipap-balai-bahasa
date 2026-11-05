"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "memeriksa" | "terpasang" | "ios" | "umum";

export function PasangAplikasi() {
  const [mode, setMode] = useState<Mode>("memeriksa");
  const [tunda, setTunda] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setMode(standalone ? "terpasang" : ios ? "ios" : "umum");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setTunda(e as BeforeInstallPromptEvent);
    };
    const onTerpasang = () => {
      setMode("terpasang");
      setTunda(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onTerpasang);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onTerpasang);
    };
  }, []);

  async function pasang() {
    if (!tunda) return;
    await tunda.prompt();
    await tunda.userChoice;
    setTunda(null);
  }

  if (mode === "memeriksa") return null;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
      <div className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-900">
        <Smartphone className="h-4 w-4 text-slate-400" />
        Aplikasi di Layar Utama
      </div>

      {mode === "terpasang" && (
        <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-brand-primary">
          <CheckCircle2 className="h-4 w-4" />
          SIPAP sudah terpasang di perangkat ini.
        </p>
      )}

      {mode === "ios" && (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12.5px] leading-snug text-slate-600">
          <li>
            Buka SIPAP di <b>Safari</b>.
          </li>
          <li>
            Ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas).
          </li>
          <li>
            Pilih <b>Tambahkan ke Layar Utama</b>, lalu <b>Tambah</b>.
          </li>
          <li>Buka SIPAP dari ikon baru di layar utama.</li>
        </ol>
      )}

      {mode === "umum" &&
        (tunda ? (
          <button
            type="button"
            onClick={pasang}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-brand-dark active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            Pasang Aplikasi
          </button>
        ) : (
          <p className="mt-2 text-[12.5px] leading-snug text-slate-500">
            Buka menu browser (⋮), lalu pilih <b>Instal aplikasi</b> atau{" "}
            <b>Tambahkan ke layar utama</b>.
          </p>
        ))}
    </div>
  );
}
