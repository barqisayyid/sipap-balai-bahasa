"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import {
  hapusLangganan,
  kirimPushUji,
  simpanLangganan,
} from "@/lib/actions/push";

type Status = "memeriksa" | "tidak_didukung" | "perlu_instal" | "siap";

function keBytes(base64Url: string) {
  const pad = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const b64 = (base64Url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const mentah = atob(b64);
  const out = new Uint8Array(mentah.length);
  for (let i = 0; i < mentah.length; i++) out[i] = mentah.charCodeAt(i);
  return out;
}

export function AktifkanPush() {
  const [status, setStatus] = useState<Status>("memeriksa");
  const [aktif, setAktif] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState<{ teks: string; galat: boolean } | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;

      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        // iPhone hanya menyediakan Web Push untuk aplikasi yang sudah di layar utama
        setStatus(ios && !standalone ? "perlu_instal" : "tidak_didukung");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      setAktif(!!(await reg.pushManager.getSubscription()));
      setStatus("siap");
    })();
  }, []);

  async function aktifkan() {
    setSibuk(true);
    setPesan(null);
    try {
      const kunci = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!kunci) {
        setPesan({ teks: "Kunci VAPID belum diatur di server.", galat: true });
        return;
      }
      const izin = await Notification.requestPermission();
      if (izin !== "granted") {
        setPesan({
          teks: "Izin notifikasi ditolak. Aktifkan lewat pengaturan browser atau ponsel.",
          galat: true,
        });
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keBytes(kunci),
        }));
      const json = sub.toJSON();

      const hasil = await simpanLangganan({
        endpoint: json.endpoint ?? "",
        keys: {
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
        },
      });
      if (hasil.error) {
        setPesan({ teks: hasil.error, galat: true });
        return;
      }
      setAktif(true);
      setPesan({ teks: "Notifikasi aktif di perangkat ini.", galat: false });
    } catch (e) {
      setPesan({
        teks: e instanceof Error ? e.message : "Gagal mengaktifkan notifikasi.",
        galat: true,
      });
    } finally {
      setSibuk(false);
    }
  }

  async function matikan() {
    setSibuk(true);
    setPesan(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await hapusLangganan(sub.endpoint);
        await sub.unsubscribe();
      }
      setAktif(false);
      setPesan({
        teks: "Notifikasi dimatikan di perangkat ini.",
        galat: false,
      });
    } catch {
      setPesan({ teks: "Gagal mematikan notifikasi.", galat: true });
    } finally {
      setSibuk(false);
    }
  }

  async function uji() {
    setSibuk(true);
    setPesan(null);
    const h = await kirimPushUji();
    setPesan(
      h.error
        ? { teks: h.error, galat: true }
        : {
            teks: "Notifikasi uji dikirim. Periksa perangkat Anda.",
            galat: false,
          },
    );
    setSibuk(false);
  }

  if (status === "memeriksa") return null;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
      <div className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-900">
        {aktif ? (
          <Bell className="h-4 w-4 text-brand-primary" />
        ) : (
          <BellOff className="h-4 w-4 text-slate-400" />
        )}
        Notifikasi Aplikasi (cadangan WhatsApp)
      </div>

      {status === "perlu_instal" && (
        <p className="mt-2 text-[12.5px] leading-snug text-slate-600">
          Di iPhone, notifikasi hanya bisa diaktifkan setelah SIPAP dipasang di
          Layar Utama. Ikuti langkah pada kartu di atas, buka SIPAP dari ikon
          barunya, lalu kembali ke halaman ini.
        </p>
      )}

      {status === "tidak_didukung" && (
        <p className="mt-2 text-[12.5px] leading-snug text-slate-500">
          Browser ini tidak mendukung notifikasi aplikasi. Pengingat tetap
          dikirim lewat WhatsApp.
        </p>
      )}

      {status === "siap" && (
        <>
          <p className="mt-1.5 text-[12px] leading-snug text-slate-500">
            Dipakai bila pesan WhatsApp gagal terkirim.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {aktif ? (
              <>
                <button
                  type="button"
                  onClick={uji}
                  disabled={sibuk}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
                >
                  {sibuk && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Kirim notifikasi uji
                </button>
                <button
                  type="button"
                  onClick={matikan}
                  disabled={sibuk}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
                >
                  Matikan
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={aktifkan}
                disabled={sibuk}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
              >
                {sibuk && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Aktifkan di perangkat ini
              </button>
            )}
          </div>
        </>
      )}

      {pesan && (
        <p
          role={pesan.galat ? "alert" : "status"}
          className={`mt-2 text-xs font-medium ${pesan.galat ? "text-red-600" : "text-brand-primary"}`}
        >
          {pesan.teks}
        </p>
      )}
    </div>
  );
}
