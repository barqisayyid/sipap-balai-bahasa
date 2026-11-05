import Link from "next/link";
import { SuratPanel } from "@/components/agenda/surat-panel";
import { bolehKelolaAgenda, getProfil, statusBolehDiubah } from "@/lib/auth";
import { StatusAksi } from "@/components/agenda/status-aksi";
import { getLampiranAgenda } from "@/lib/data/lampiran";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  CornerUpRight,
  MapPin,
  Shirt,
  Users,
  X,
} from "lucide-react";
import { BackButton } from "@/components/layout/back-button";
import { AgendaMenu } from "@/components/agenda/agenda-menu";
import { getAgendaById } from "@/lib/data/agenda";
import { STATUS_STYLE, getInfoStatusLifecycle } from "@/lib/status";
import type { StatusAgenda } from "@/lib/types";
import { dateKeyWIB, formatRentangJam, formatTanggalPanjang } from "@/lib/date";
import {
  MinangWatermark,
  CapStempelKedinasan,
} from "@/components/ui/minang-motif";
import { FlashToast } from "@/components/ui/flash-toast";

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
  const infoLifecycle = getInfoStatusLifecycle(
    agenda.status,
    agenda.waktuMulai,
    agenda.waktuSelesai,
  );
  const tgl = dateKeyWIB(agenda.waktuMulai);
  const profil = await getProfil();
  const bolehKelola = !!profil && bolehKelolaAgenda(profil.role);
  const lampiran = agenda.isSensitive ? [] : await getLampiranAgenda(agenda.id);
  const pilihanStatus = profil
    ? statusBolehDiubah(profil.role).filter((s) => s !== agenda.status)
    : [];

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Top Bar Navigasi */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <BackButton
            fallback={tgl ? `/kalender?tgl=${tgl}` : "/agenda"}
            forceFallback={Boolean(sp.edit || sp.baru)}
          />
          <span className="text-[15px] font-bold tracking-tight text-slate-900">
            Detail Agenda
          </span>
        </div>

        <div className="flex items-center gap-1">
          {bolehKelola && (
            <Link
              href={`/agenda/${agenda.id}/edit`}
              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-brand-primary hover:bg-emerald-100 transition-colors"
            >
              Ubah
            </Link>
          )}
          <AgendaMenu agenda={agenda} bolehKelola={bolehKelola} />
        </div>
      </header>

      <main className="flex-1 bg-slate-50/60 pb-6">
        <div className="mx-auto max-w-lg space-y-3.5 p-4">
          {/* Toast Notifikasi Sukses Cerdas (auto-dismiss & URL cleanup) */}
          {sp.baru && (
            <FlashToast message="Agenda baru berhasil dijadwalkan." />
          )}
          {sp.edit && (
            <FlashToast message="Perubahan agenda berhasil disimpan." />
          )}

          {/* Kartu Lembar Dokumen Agenda Resmi */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            {/* Watermark Ornamen Tradisional Minangkabau (image.svg) */}
            <MinangWatermark
              opacity={0.065}
              color="emerald"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            />

            {/* Gradient putih pelindung kontras teks: sisi kiri 100% bersih, tajam, dan mudah dibaca */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, #ffffff 0%, #ffffff 32%, rgba(255, 255, 255, 0.85) 60%, transparent 95%)",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-primary" />
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-brand-dark/80">
                    Agenda Resmi Balai Bahasa
                  </span>
                </div>
                {agenda.nomorSurat && (
                  <span className="text-[11.5px] font-normal text-slate-400 truncate max-w-[160px]">
                    No. <span className="font-semibold text-slate-600">{agenda.nomorSurat}</span>
                  </span>
                )}
              </div>

              <div className="mt-3.5 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h1 className="text-[21px] font-bold leading-snug tracking-tight text-slate-950 [text-wrap:balance]">
                    {agenda.perihal}
                  </h1>
                  {agenda.pengirim && (
                    <p className="mt-1.5 text-[13px] font-normal text-slate-500">
                      Penyelenggara:{" "}
                      <span className="font-semibold text-slate-800">
                        {agenda.pengirim}
                      </span>
                    </p>
                  )}
                </div>

                {/* Stempel Cap Kedinasan Resmi */}
                <CapStempelKedinasan status={agenda.status} className="shrink-0 mt-0.5" />
              </div>

              {/* Garis Pembatas Tunggal Bersih */}
              <div className="my-4 border-t border-slate-100" />

              {/* Rincian Waktu & Lokasi */}
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="h-4.5 w-4.5 mt-0.5 text-slate-400 shrink-0" />
                  <div className="leading-tight">
                    <p className="text-[14px] font-semibold text-slate-900">
                      {formatTanggalPanjang(agenda.waktuMulai)}
                    </p>
                    <p className="mt-1 text-[12px] font-normal tabular-nums text-slate-500">
                      {formatRentangJam(agenda.waktuMulai, agenda.waktuSelesai)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4.5 w-4.5 mt-0.5 text-slate-400 shrink-0" />
                  <div className="leading-tight">
                    {agenda.linkMaps ? (
                      <a
                        href={agenda.linkMaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13.5px] font-semibold text-brand-primary underline underline-offset-2 hover:text-brand-dark"
                      >
                        {agenda.lokasi}
                      </a>
                    ) : (
                      <span className="text-[13.5px] font-semibold text-slate-900">
                        {agenda.lokasi}
                      </span>
                    )}
                  </div>
                </div>

                {agenda.pakaian && (
                  <div className="flex items-center gap-2.5">
                    <Shirt className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div className="text-[13px]">
                      <span className="font-normal text-slate-500">Pakaian: </span>
                      <span className="font-semibold text-slate-800">{agenda.pakaian}</span>
                    </div>
                  </div>
                )}

                {agenda.pendamping && (
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div className="text-[13px]">
                      <span className="font-normal text-slate-500">Pendamping: </span>
                      <span className="font-semibold text-slate-800">{agenda.pendamping}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Kartu Status Kehadiran */}
          <section>
            <div className={`rounded-xl border border-slate-200/80 p-3.5 ${gaya.card}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${gaya.circle}`}>
                    {infoLifecycle.ikon === "CheckCheck" ? (
                      <CheckCheck className="h-4 w-4" strokeWidth={2.4} />
                    ) : (
                      <IkonStatus className="h-4 w-4" strokeWidth={2.4} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status Kehadiran
                      </span>
                      {infoLifecycle.fase === "berlangsung" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                      )}
                    </div>
                    <span className="block text-[15.5px] font-bold leading-tight tracking-tight text-slate-950">
                      {infoLifecycle.labelLengkap}
                    </span>
                    <p className="mt-1 text-[12px] font-normal text-slate-600 leading-relaxed">
                      {infoLifecycle.keterangan}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Aksi Ubah Status (Kepala Balai / Pemantau) */}
            {pilihanStatus.length > 0 && (
              <div className="mt-2.5">
                <StatusAksi
                  agendaId={agenda.id}
                  pilihan={pilihanStatus}
                />
              </div>
            )}
          </section>

          {/* Panel Berkas Surat & Lampiran */}
          <SuratPanel
            agendaId={agenda.id}
            lampiran={lampiran}
            bolehKelola={bolehKelola}
            sensitif={agenda.isSensitive}
          />

          {/* Catatan Tambahan */}
          {agenda.catatan && (
            <section className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                Catatan Tambahan
              </h2>
              <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] font-normal leading-relaxed text-slate-800">
                {agenda.catatan}
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
