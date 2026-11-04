import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AgendaRow } from "@/components/agenda/agenda-row";
import { LiveClock } from "@/components/layout/live-clock";
import { getAgendaBulan } from "@/lib/data/agenda";
import { STATUS_STYLE } from "@/lib/status";
import type { StatusAgenda } from "@/lib/types";
import { dateKeyWIB, formatTanggalSingkat, getNow } from "@/lib/date";
import {
  HARI_SINGKAT,
  bulanBerikutnya,
  bulanSebelumnya,
  buatGridBulan,
  kunciBulan,
  kunciTanggal,
  namaBulanTahun,
  parseBulan,
} from "@/lib/calendar";

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tgl?: string }>;
}) {
  const sp = await searchParams;
  const now = getNow();
  const hariIniKey = dateKeyWIB(now);

  const tb = parseBulan(sp.bulan, now);
  const kBulan = kunciBulan(tb);
  const agendaBulan = await getAgendaBulan(tb.tahun, tb.bulan);

  // Penanda titik per tanggal: "Menunggu Konfirmasi" diprioritaskan
  const penanda = new Map<string, StatusAgenda>();
  for (const a of agendaBulan) {
    const k = dateKeyWIB(a.waktuMulai);
    if (penanda.get(k) !== "Menunggu Konfirmasi") penanda.set(k, a.status);
  }

  // Tanggal terpilih: dari URL, atau hari ini (jika bulan ini), atau tanggal 1
  const tglParam =
    sp.tgl &&
    /^\d{4}-\d{2}-\d{2}$/.test(sp.tgl) &&
    sp.tgl.startsWith(kBulan + "-")
      ? sp.tgl
      : null;
  const terpilih =
    tglParam ??
    (hariIniKey.startsWith(kBulan + "-") ? hariIniKey : `${kBulan}-01`);

  const agendaTerpilih = agendaBulan.filter(
    (a) => dateKeyWIB(a.waktuMulai) === terpilih,
  );
  const judulDaftar =
    terpilih === hariIniKey
      ? "Agenda Hari Ini"
      : `Agenda ${formatTanggalSingkat(new Date(`${terpilih}T12:00:00+07:00`))}`;

  const sebelumnya = kunciBulan(bulanSebelumnya(tb));
  const berikutnya = kunciBulan(bulanBerikutnya(tb));
  const grid = buatGridBulan(tb);

  return (
    <div className="px-5 pt-6 pb-24">
      {/* Header dengan Jam Live */}
      <section className="mb-5 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5EE] text-brand-primary">
            <CalendarDays className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#16201a]">
            Kalender Agenda
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LiveClock variant="header" />
          <button
            type="button"
            aria-label="Cari agenda"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 hover:bg-black/5 active:scale-95"
          >
            <Search className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      </section>

      {/* Navigasi bulan */}
      <section className="mb-4 flex items-center justify-between px-2">
        <Link
          href={`/kalender?bulan=${sebelumnya}`}
          scroll={false}
          aria-label="Bulan sebelumnya"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f7f5] text-gray-700 hover:bg-gray-200/80 active:scale-90"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        </Link>
        <h2 className="text-[17px] font-bold tracking-tight text-slate-800">
          {namaBulanTahun(tb)}
        </h2>
        <Link
          href={`/kalender?bulan=${berikutnya}`}
          scroll={false}
          aria-label="Bulan berikutnya"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f7f5] text-gray-700 hover:bg-gray-200/80 active:scale-90"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </section>

      {/* Grid kalender */}
      <section className="mb-5 px-1" aria-label="Kalender bulanan">
        <div className="mb-2 grid grid-cols-7 text-center">
          {HARI_SINGKAT.map((h) => (
            <span key={h} className="text-[13px] font-medium text-slate-400">
              {h}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center text-[15px] font-medium text-slate-800">
          {grid.map((hari, i) => {
            if (hari === null) return <div key={`kosong-${i}`} />;

            const key = kunciTanggal(tb, hari);
            const dipilih = key === terpilih;
            const hariIni = key === hariIniKey;
            const status = penanda.get(key);

            return (
              <Link
                key={key}
                href={`/kalender?bulan=${kBulan}&tgl=${key}`}
                scroll={false}
                aria-label={`Tanggal ${hari}`}
                aria-current={dipilih ? "date" : undefined}
                className="flex h-11 flex-col items-center justify-center"
              >
                <span
                  className={`flex h-[34px] w-[34px] items-center justify-center rounded-full ${
                    dipilih
                      ? "bg-brand-primary font-bold text-white shadow-sm"
                      : hariIni
                        ? "font-bold text-brand-primary"
                        : ""
                  }`}
                >
                  {hari}
                </span>
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${
                    status ? STATUS_STYLE[status].dot : "bg-transparent"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Daftar agenda pada tanggal terpilih */}
      <section
        aria-label={judulDaftar}
        className="mt-1 rounded-3xl border border-slate-100/80 bg-white p-4 pt-3.5 shadow-sm"
      >
        <div className="mb-3.5 flex items-center justify-between px-0.5">
          <h3 className="text-base font-bold tracking-tight text-slate-900">
            {judulDaftar}
          </h3>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <span className="h-2 w-2 rounded-full bg-brand-primary" />
            {agendaTerpilih.length} Agenda
          </span>
        </div>

        {agendaTerpilih.length > 0 ? (
          <div className="space-y-3.5">
            {agendaTerpilih.map((a) => (
              <AgendaRow key={a.id} agenda={a} />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-slate-400">
            Tidak ada agenda pada tanggal ini.
          </p>
        )}
      </section>
    </div>
  );
}
