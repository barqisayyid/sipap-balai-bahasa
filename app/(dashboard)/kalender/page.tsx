import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="px-5 pt-5 pb-24">
      {/* Header dengan Jam Live */}
      <section className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-brand-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight text-slate-900">
              Kalender Agenda
            </h1>
            <p className="text-[11px] text-slate-500">
              Balai Bahasa Sumatera Barat
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LiveClock variant="header" />
        </div>
      </section>

      {/* Navigasi bulan */}
      <section className="mb-3 flex items-center justify-between px-1">
        <Link
          href={`/kalender?bulan=${sebelumnya}`}
          scroll={false}
          aria-label="Bulan sebelumnya"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
        </Link>
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
          {namaBulanTahun(tb)}
        </h2>
        <Link
          href={`/kalender?bulan=${berikutnya}`}
          scroll={false}
          aria-label="Bulan berikutnya"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-colors"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
        </Link>
      </section>

      {/* Grid kalender */}
      <section className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs" aria-label="Kalender bulanan">
        <div className="mb-2 grid grid-cols-7 text-center">
          {HARI_SINGKAT.map((h) => (
            <span key={h} className="text-[11.5px] font-semibold text-slate-500">
              {h}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center text-[13.5px] font-medium tabular-nums text-slate-800">
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
                className="flex h-10 flex-col items-center justify-center"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                    dipilih
                      ? "bg-brand-primary font-semibold text-white shadow-2xs"
                      : hariIni
                        ? "border border-brand-primary/40 font-semibold text-brand-primary"
                        : "hover:bg-slate-100"
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
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs"
      >
        <div className="mb-3 flex items-center justify-between px-0.5">
          <h3 className="text-[14.5px] font-semibold tracking-tight text-slate-900">
            {judulDaftar}
          </h3>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
            {agendaTerpilih.length} Agenda
          </span>
        </div>

        {agendaTerpilih.length > 0 ? (
          <div className="space-y-2">
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
