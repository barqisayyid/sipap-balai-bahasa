import Link from "next/link";

import {
  ArrowRight,
  BellRing,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { SipapLogo } from "@/components/layout/sipap-logo";
import { LiveClock } from "@/components/layout/live-clock";
import { AgendaCard } from "@/components/agenda/agenda-card";
import { bolehKelolaAgenda, getProfil, statusBolehDiubah } from "@/lib/auth";
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
import {
  MinangWatermark,
} from "@/components/ui/minang-motif";

export default async function BerandaPage() {
  const now = getNow();
  const profil = await getProfil();
  const [hariIni, terdekat, menunggu] = await Promise.all([
    getAgendaByDate(dateKeyWIB(now)),
    getAgendaTerdekat(now, 3),
    getDaftarAgenda("menunggu", now),
  ]);
  const tgl = bagianTanggal(now);
  const bolehKelola = !!profil && bolehKelolaAgenda(profil.role);
  const bolehKonfirmasi =
    !!profil && statusBolehDiubah(profil.role).includes("Hadir");

  return (
    <div className="relative">
      <div className="relative z-10">
        {/* Header dengan Jam Live */}
        <header className="flex items-center justify-between px-5 pb-3 pt-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <SipapLogo className="h-9 w-9" />
            <div className="flex flex-col">
              <h1 className="text-[18px] font-extrabold leading-none tracking-tight text-slate-900">
                SIPAP
              </h1>
              <p className="mt-1 text-[11.5px] font-normal leading-tight text-slate-500">
                Balai Bahasa Sumatera Barat
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <LiveClock variant="header" />
          </div>
        </header>

        {/* Sapaan Pengguna */}
        <section className="px-5 pt-4 pb-2">
          <p className="text-[13px] font-medium text-slate-500">
            {salam(now)},
          </p>
          <h2 className="mt-0.5 text-[22px] font-extrabold tracking-tight text-slate-950">
            {profil?.fullName ?? "Pimpinan"}
          </h2>
        </section>

        {/* Kartu Ringkasan Hero: Deep Emerald Heritage + Watermark Minang + Double Rule */}
        <section className="mt-2 px-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#063820] via-[#094d2d] to-[#0d5c38] p-4 text-white shadow-xs border border-emerald-950/40">
            {/* Watermark Ornamen Ukiran Tradisional Minangkabau (image.svg) */}
            <MinangWatermark
              opacity={0.13}
              color="white"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            />

            <div className="relative z-10">
              {/* Baris Atas: Tanggal Panjang & Tombol Pintasan Kalender */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-emerald-200 border border-white/10">
                    <CalendarDays className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[13px] font-medium text-white/95 tracking-wide">
                    {formatTanggalPanjang(now)}
                  </span>
                </div>
                <Link
                  href="/kalender"
                  aria-label="Buka kalender"
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11.5px] font-medium text-emerald-100 hover:bg-white/15 hover:text-white transition-colors border border-white/10"
                >
                  <span>Kalender</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Garis Pembatas Tunggal Bersih */}
              <div className="my-3.5 border-t border-white/15" />

              {/* Baris Bawah: Angka Tanggal & Ringkasan Agenda Hari Ini */}
              <div className="flex items-center gap-3">
                <div className="flex min-w-[70px] flex-col items-center border-r border-white/15 pr-3.5">
                  <span className="text-[36px] font-extrabold leading-none tracking-tight tabular-nums text-white">
                    {tgl.hari}
                  </span>
                  <span className="mt-1.5 text-[11px] font-bold text-emerald-200/90 uppercase tracking-wider">
                    {tgl.bulan} · {tgl.namaHari}
                  </span>
                </div>

                <div className="flex flex-1 items-center justify-between gap-2.5 rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 backdrop-blur-[2px]">
                  <div className="flex flex-col">
                    {hariIni.length > 0 ? (
                      <>
                        <span className="text-[15px] font-bold text-white leading-tight">
                          {hariIni.length} Agenda Terjadwal
                        </span>
                        <span className="text-[12px] text-emerald-100/80 font-normal">
                          Hari ini di Balai Bahasa
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[14px] font-semibold text-white/95 leading-tight">
                          Tidak ada agenda
                        </span>
                        <span className="text-[11.5px] text-emerald-200/75 font-normal">
                          Jadwal pimpinan kosong hari ini
                        </span>
                      </>
                    )}
                  </div>
                  <Link
                    href="/agenda"
                    aria-label="Lihat daftar agenda"
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/35 hover:text-white transition-colors border border-emerald-400/25"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {bolehKonfirmasi && menunggu.length > 0 && (
          <section className="mt-3 px-5">
            <Link
              href="/agenda/antrean-konfirmasi"
              className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-amber-900 transition-colors hover:bg-amber-50"
            >
              <BellRing className="h-4 w-4 shrink-0 text-amber-700" />
              <span className="flex-1 text-[13px] font-medium text-amber-900">
                <strong className="font-semibold">{menunggu.length} agenda</strong> perlu konfirmasi kehadiran
              </span>
              <ChevronRight className="h-4 w-4 text-amber-700" />
            </Link>
          </section>
        )}

        {/* Agenda terdekat */}
        <section className="mt-5 px-5">
          <div className="mb-2.5 flex items-center justify-between px-0.5">
            <h3 className="text-[16px] font-bold tracking-tight text-slate-950">
              Agenda Terdekat
            </h3>
            <Link
              href="/agenda"
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-primary hover:text-brand-dark transition-colors"
            >
              Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {terdekat.length > 0 ? (
              terdekat.map((a) => (
                <AgendaCard key={a.id} agenda={a} bolehKelola={bolehKelola} />
              ))
            ) : (
              <p className="rounded-xl border border-slate-200/80 bg-white p-4 text-[13.5px] font-normal text-slate-400 text-center">
                Belum ada agenda mendatang.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
