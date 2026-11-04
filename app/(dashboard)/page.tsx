import Link from "next/link";

import {
  ArrowRight,
  Bell,
  BellRing,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { SipapLogo } from "@/components/layout/sipap-logo";
import { AgendaCard } from "@/components/agenda/agenda-card";
import { getProfil, statusBolehDiubah } from "@/lib/auth";
import {
  getAgendaByDate,
  getAgendaTerdekat,
  getDaftarAgenda,
} from "@/lib/data/agenda";
import {
  bagianTanggal,
  dateKeyWIB,
  formatTanggalPanjang,
  getNow,
  salam,
} from "@/lib/date";

// const NAMA_PANGGILAN = "Bapak Kepala"; // nanti diambil dari tabel profiles

export default async function BerandaPage() {
  const now = getNow();
  const profil = await getProfil();
  const [hariIni, terdekat] = await Promise.all([
    getAgendaByDate(dateKeyWIB(now)),
    getAgendaTerdekat(now, 3),
  ]);
  const tgl = bagianTanggal(now);
  const bolehKonfirmasi =
    !!profil && statusBolehDiubah(profil.role).includes("Hadir");
  const menunggu = bolehKonfirmasi
    ? await getDaftarAgenda("menunggu", now)
    : [];

  return (
    <div className="relative">
      {/* Latar gradasi hijau lembut di bagian atas */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[300px]"
        style={{
          background:
            "linear-gradient(180deg, #E3F3EA 0%, rgba(247,250,248,0) 100%)",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 pb-3 pt-6">
          <div className="flex items-center gap-3">
            <SipapLogo />
            <div className="flex flex-col">
              <h1 className="text-[19px] font-extrabold leading-none tracking-tight">
                SIPAP
              </h1>
              <p className="mt-1 text-[11px] font-medium leading-tight text-slate-500">
                Balai Bahasa
                <br />
                Sumatera Barat
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative rounded-full p-2 hover:bg-slate-100"
          >
            <Bell className="h-6 w-6 text-slate-800" strokeWidth={1.8} />
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </header>

        {/* Sapaan */}
        <section className="px-6 pb-4 pt-5">
          <p className="text-[17px] text-slate-700">{salam(now)},</p>
          <h2 className="mt-0.5 flex items-center gap-1.5 text-[27px] font-extrabold leading-none tracking-tight">
            {profil?.fullName ?? "Pengguna"}{" "}
            <span className="text-2xl">👋</span>
          </h2>
          <p className="mt-2 text-[14px] text-slate-500">
            Semoga hari ini berjalan lancar.
          </p>
        </section>

        {/* Kartu ringkasan hari ini */}
        <section className="mt-2 px-5">
          <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <span className="text-[14.5px] font-bold text-slate-800">
                  {formatTanggalPanjang(now)}
                </span>
              </div>
              <Link
                href="/kalender"
                aria-label="Buka kalender"
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-3.5">
              <div className="flex min-w-[72px] flex-col items-center border-r border-slate-200 pr-3">
                <span className="text-[34px] font-extrabold leading-none tracking-tight">
                  {tgl.hari}
                </span>
                <span className="mt-1 text-[12px] font-semibold text-slate-500">
                  {tgl.bulan} • {tgl.namaHari}
                </span>
              </div>
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#E1F2E6] bg-brand-mint px-3.5 py-3">
                <CalendarDays className="h-6 w-6 shrink-0 text-brand-primary" />
                <div className="flex flex-col text-[14px] font-bold leading-tight">
                  {hariIni.length > 0 ? (
                    <>
                      <span>{hariIni.length} Agenda</span>
                      <span>Hari Ini</span>
                    </>
                  ) : (
                    <span>Tidak ada agenda hari ini</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {menunggu.length > 0 && (
          <section className="mt-4 px-5">
            <Link
              href="/agenda/antrean-konfirmasi"
              className="flex items-center gap-3 rounded-2xl border border-[#FEDDC3] bg-brand-amber-light px-4 py-3.5"
            >
              <BellRing className="h-5 w-5 shrink-0 text-[#EA580C]" />
              <span className="flex-1 text-[13.5px] font-bold text-[#C2410C]">
                {menunggu.length} agenda belum dikonfirmasi
              </span>
              <ChevronRight className="h-4 w-4 text-[#EA580C]" />
            </Link>
          </section>
        )}

        {/* Agenda terdekat */}
        <section className="mt-6 px-5">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-[18px] font-bold tracking-tight">
              Agenda Terdekat
            </h3>
            <Link
              href="/agenda"
              className="inline-flex items-center gap-1 text-[13px] font-bold text-brand-primary hover:opacity-80"
            >
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {terdekat.length > 0 ? (
              terdekat.map((a) => <AgendaCard key={a.id} agenda={a} />)
            ) : (
              <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">
                Belum ada agenda mendatang.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
