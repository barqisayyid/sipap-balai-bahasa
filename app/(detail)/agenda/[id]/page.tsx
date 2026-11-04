import Link from "next/link";
import { SuratPanel } from "@/components/agenda/surat-panel";
import { bolehKelolaAgenda, getProfil, statusBolehDiubah } from "@/lib/auth";
import { StatusAksi } from "@/components/agenda/status-aksi";
import { getLampiranAgenda } from "@/lib/data/lampiran";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  CornerUpRight,
  MapPin,
  Shirt,
  X,
} from "lucide-react";
import { BackButton } from "@/components/layout/back-button";
import { AgendaMenu } from "@/components/agenda/agenda-menu";
import { HeroKalender } from "@/components/agenda/hero-kalender";
import { getAgendaById } from "@/lib/data/agenda";
import { STATUS_STYLE } from "@/lib/status";
import type { StatusAgenda } from "@/lib/types";
import { dateKeyWIB, formatRentangJam, formatTanggalPanjang } from "@/lib/date";

const IKON_STATUS: Record<StatusAgenda, typeof Check> = {
  Hadir: Check,
  "Menunggu Konfirmasi": Clock,
  Didisposisikan: CornerUpRight,
  Batal: X,
};

export default async function DetailAgendaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ baru?: string; edit?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const angka = Number(id);
  const agenda = Number.isInteger(angka) ? await getAgendaById(angka) : null;
  if (!agenda) notFound();

  const gaya = STATUS_STYLE[agenda.status];
  const IkonStatus = IKON_STATUS[agenda.status];
  const tgl = dateKeyWIB(agenda.waktuMulai);
  const profil = await getProfil();
  const lampiran = agenda.isSensitive ? [] : await getLampiranAgenda(agenda.id);
  const pilihanStatus = profil
    ? statusBolehDiubah(profil.role).filter((s) => s !== agenda.status)
    : [];

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{
        background:
          "radial-gradient(circle at 100% 0%, #c4e4d4 0%, #e2f2ea 25%, #f6faf8 55%, #ffffff 80%)",
      }}
    >
      {/* Bar atas */}
      <nav className="flex items-center justify-between px-6 pb-1 pt-5">
        <BackButton fallback="/kalender" />
        <AgendaMenu
          agenda={agenda}
          bolehKelola={!!profil && bolehKelolaAgenda(profil.role)}
        />
      </nav>

      <main className="flex flex-1 flex-col justify-between px-7 pt-1">
        <div>
          {sp.baru === "1" && (
            <div
              role="status"
              className="mb-3 flex items-center gap-2 rounded-2xl border border-[#D5EFE0] bg-brand-mint px-4 py-3 text-[13px] font-semibold text-brand-primary"
            >
              <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
              Agenda berhasil disimpan.
            </div>
          )}
          {sp.edit === "1" && (
            <div
              role="status"
              className="mb-3 flex items-center gap-2 rounded-2xl border border-[#D5EFE0] bg-brand-mint px-4 py-3 text-[13px] font-semibold text-brand-primary"
            >
              <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
              Perubahan agenda berhasil disimpan.
            </div>
          )}
          {/* Ilustrasi */}
          <section className="relative my-2 flex items-center justify-center">
            <div className="absolute -top-2 h-28 w-56 rounded-full bg-[#d8eee3]/65 blur-xl" />
            <div className="absolute right-9 top-4 h-12 w-12 rounded-full bg-[#c9e8d7]/80" />
            <div className="relative h-48 w-48 drop-shadow-[0_16px_24px_rgba(30,70,50,0.14)]">
              <HeroKalender />
            </div>
          </section>

          {/* Judul */}
          <section className="mt-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#dcf1e5] px-3 py-1 text-[13px] font-semibold tracking-wide text-[#136a3e]">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#136a3e] text-white">
                <Check className="h-2.5 w-2.5" strokeWidth={4} />
              </span>
              Agenda Resmi
            </div>
            <h1 className="mt-3 text-[26px] font-extrabold leading-[1.25] tracking-tight text-[#091b29]">
              {agenda.perihal}
            </h1>
          </section>

          {/* Metadata */}
          <section className="mt-5 space-y-3.5 text-[14.5px]">
            <div className="flex items-start gap-4">
              <CalendarDays
                className="mt-0.5 h-5 w-5 shrink-0 text-slate-500"
                strokeWidth={1.8}
              />
              <div className="leading-tight">
                <p className="font-semibold text-slate-700">
                  {formatTanggalPanjang(agenda.waktuMulai)}
                </p>
                <p className="mt-0.5 font-medium text-slate-500">
                  {formatRentangJam(agenda.waktuMulai, agenda.waktuSelesai)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <MapPin
                className="h-5 w-5 shrink-0 text-slate-500"
                strokeWidth={1.8}
              />
              {agenda.linkMaps ? (
                <a
                  href={agenda.linkMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4"
                >
                  {agenda.lokasi}
                </a>
              ) : (
                <span className="font-semibold text-slate-700">
                  {agenda.lokasi}
                </span>
              )}
            </div>

            {agenda.pakaian && (
              <div className="flex items-center gap-4">
                <Shirt
                  className="h-5 w-5 shrink-0 text-slate-500"
                  strokeWidth={1.8}
                />
                <span className="font-semibold text-slate-700">
                  {agenda.pakaian}
                </span>
              </div>
            )}
          </section>

          {/* Status kehadiran */}
          <section className="mt-5">
            <div
              className={`flex items-center justify-between rounded-[22px] px-5 py-3.5 ${gaya.card}`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm ${gaya.circle}`}
                >
                  <IkonStatus className="h-5 w-5" strokeWidth={2.8} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-600">
                    Status Kehadiran
                  </span>
                  <span
                    className={`block text-[17px] font-bold leading-tight ${gaya.teks}`}
                  >
                    {agenda.status}
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`h-5 w-5 ${gaya.teks}`}
                strokeWidth={2.4}
              />
            </div>
          </section>
          {pilihanStatus.length > 0 && (
            <StatusAksi agendaId={agenda.id} pilihan={pilihanStatus} />
          )}

          {/* Catatan */}
          <section className="mt-5">
            <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">
              Catatan Agenda
            </h2>
            <p className="mt-1 text-[13.5px] leading-snug text-slate-500">
              {agenda.catatan ?? "Tidak ada catatan."}
            </p>
          </section>
          <SuratPanel
            agendaId={agenda.id}
            lampiran={lampiran}
            bolehKelola={!!profil && bolehKelolaAgenda(profil.role)}
            sensitif={agenda.isSensitive}
          />
        </div>

        {/* Tombol aksi */}
        <footer
          className="pt-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <Link
            href={`/kalender?bulan=${tgl.slice(0, 7)}&tgl=${tgl}`}
            className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[#136a3e] py-3.5 text-[15px] font-bold text-[#136a3e] transition-all hover:bg-[#136a3e]/5 active:scale-[0.99]"
          >
            <CalendarDays className="h-5 w-5" strokeWidth={2} />
            Lihat di Kalender
          </Link>
        </footer>
      </main>
    </div>
  );
}
