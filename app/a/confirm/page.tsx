import type { Metadata } from "next";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Shirt,
} from "lucide-react";
import { SipapLogo } from "@/components/layout/sipap-logo";
import { konfirmasiQuick } from "@/lib/actions/quick-action";
import { formatRentangJam, formatTanggalPanjang } from "@/lib/date";
import { periksaToken, type AgendaToken } from "@/lib/quick-action";

export const metadata: Metadata = {
  title: "Konfirmasi Agenda - SIPAP",
  robots: { index: false, follow: false },
};

const PESAN = {
  tidak_valid: {
    judul: "Tautan tidak valid",
    isi: "Tautan ini tidak dikenali. Gunakan tautan dari pesan WhatsApp terbaru, atau buka aplikasi SIPAP.",
  },
  dibatalkan: {
    judul: "Agenda dibatalkan",
    isi: "Agenda ini sudah dibatalkan, sehingga tidak perlu dikonfirmasi.",
  },
  kedaluwarsa: {
    judul: "Tautan sudah kedaluwarsa",
    isi: "Acara ini sudah selesai, sehingga konfirmasi tidak dapat dilakukan lagi.",
  },
  sudah_dipakai: {
    judul: "Agenda sudah ditanggapi",
    isi: "Tautan ini hanya berlaku satu kali. Status agenda sudah tercatat di SIPAP.",
  },
} as const;

function Ringkasan({ agenda }: { agenda: AgendaToken }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      <h2 className="text-[17px] font-semibold leading-snug tracking-tight text-slate-900">
        {agenda.perihal}
      </h2>
      <div className="mt-4 space-y-2.5 text-[13.5px] font-medium text-slate-700 border-t border-slate-100 pt-3">
        <p className="flex items-start gap-2.5">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>{formatTanggalPanjang(agenda.waktuMulai)}</span>
        </p>
        <p className="flex items-start gap-2.5">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span className="font-semibold tabular-nums text-slate-700">
            {formatRentangJam(agenda.waktuMulai, agenda.waktuSelesai)} WIB
          </span>
        </p>
        <p className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>{agenda.lokasi}</span>
        </p>
        {agenda.pakaian && (
          <p className="flex items-start gap-2.5">
            <Shirt className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>Pakaian: {agenda.pakaian}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default async function KonfirmasiPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; action?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token ?? "";
  const hasil = await periksaToken(token);

  const berhasil =
    sp.ok === "1" &&
    !hasil.ok &&
    hasil.alasan === "sudah_dipakai" &&
    !!hasil.agenda &&
    (hasil.agenda.status === "Hadir" ||
      hasil.agenda.status === "Didisposisikan");

  const utama = sp.action === "disposisi" ? "disposisi" : "hadir";
  const gayaUtama =
    "flex w-full items-center justify-center rounded-xl bg-brand-primary py-3.5 text-[14.5px] font-semibold text-white shadow-2xs transition-colors hover:bg-brand-dark active:scale-[0.98]";
  const gayaKedua =
    "flex w-full items-center justify-center rounded-xl border border-slate-200/90 bg-white py-3.5 text-[14.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98]";

  return (
    <div className="flex min-h-dvh flex-col bg-white px-5 py-6">
      <header className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <SipapLogo className="h-9 w-9" />
        <div>
          <p className="text-[16px] font-bold leading-none tracking-tight text-slate-900">
            SIPAP
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Balai Bahasa Sumatera Barat
          </p>
        </div>
      </header>

      {hasil.ok ? (
        <>
          <p className="mb-3 text-[13.5px] font-medium text-slate-600">
            Mohon konfirmasi kehadiran Kepala Balai:
          </p>
          <Ringkasan agenda={hasil.agenda} />

          <form action={konfirmasiQuick} className="mt-5 space-y-2.5">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              name="aksi"
              value="hadir"
              className={utama === "hadir" ? gayaUtama : gayaKedua}
            >
              Ya, Saya Hadir
            </button>
            <button
              type="submit"
              name="aksi"
              value="disposisi"
              className={utama === "disposisi" ? gayaUtama : gayaKedua}
            >
              Disposisikan
            </button>
          </form>
          <p className="mt-3.5 text-center text-[11.5px] text-slate-400">
            Tautan konfirmasi instan ini hanya berlaku satu kali.
          </p>
        </>
      ) : berhasil && hasil.agenda ? (
        <>
          <div className="mb-4 flex flex-col items-center text-center">
            <CheckCircle2
              className="h-12 w-12 text-brand-primary"
              strokeWidth={1.8}
            />
            <h1 className="mt-2.5 text-[18px] font-semibold tracking-tight text-slate-900">
              {hasil.agenda.status === "Hadir"
                ? "Kehadiran Dikonfirmasi"
                : "Agenda Didisposisikan"}
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Status agenda di sistem SIPAP sudah diperbarui.
            </p>
          </div>
          <Ringkasan agenda={hasil.agenda} />
        </>
      ) : (
        !hasil.ok && (
          <>
            <div className="mb-4 flex flex-col items-center text-center">
              <AlertTriangle
                className="h-12 w-12 text-amber-500"
                strokeWidth={1.8}
              />
              <h1 className="mt-2.5 text-[18px] font-semibold tracking-tight text-slate-900">
                {PESAN[hasil.alasan].judul}
              </h1>
              <p className="mt-1 max-w-[320px] text-[13px] leading-snug text-slate-500">
                {PESAN[hasil.alasan].isi}
              </p>
              {hasil.alasan === "sudah_dipakai" && hasil.agenda && (
                <p className="mt-2 text-[13px] font-medium text-brand-primary">
                  Status saat ini: {hasil.agenda.status}
                </p>
              )}
            </div>
            {hasil.agenda && <Ringkasan agenda={hasil.agenda} />}
          </>
        )
      )}
    </div>
  );
}
