"use client";

import {
  startTransition,
  useActionState,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { ConflictBadge } from "@/components/calendar/conflict-badge";
import { simpanAgenda } from "@/lib/actions/agenda";
import { cariBentrok } from "@/lib/conflict";
import { waktuWIB } from "@/lib/date";
import type { AgendaRingkas } from "@/lib/types";

const inputCls =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20";

function Field({
  label,
  wajib,
  error,
  children,
}: {
  label: string;
  wajib?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {label}
        {wajib && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export function AgendaForm({
  agendaAktif,
  tanggalDefault,
}: {
  agendaAktif: AgendaRingkas[];
  tanggalDefault: string;
}) {
  const [state, formAction, pending] = useActionState(simpanAgenda, null);
  const err = state?.errors ?? {};

  // Tiga isian ini dipantau agar bentrok terdeteksi saat mengetik
  const [tanggal, setTanggal] = useState(tanggalDefault);
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");
  const [izinkan, setIzinkan] = useState(false);

  const bentrok = useMemo(() => {
    if (!tanggal || !jamMulai || !jamSelesai || jamSelesai <= jamMulai)
      return [];
    return cariBentrok(
      {
        waktuMulai: waktuWIB(tanggal, jamMulai),
        waktuSelesai: waktuWIB(tanggal, jamSelesai),
      },
      agendaAktif,
    );
  }, [tanggal, jamMulai, jamSelesai, agendaAktif]);

  // Dikirim lewat onSubmit (bukan action=) agar isian tidak di-reset saat ada error
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  const terkunci = bentrok.length > 0 && !izinkan;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Kolom wajib */}
      <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-[15px] font-extrabold tracking-tight">
          Informasi Utama
        </h2>

        <Field label="Perihal / Nama Kegiatan" wajib error={err.perihal}>
          <input
            name="perihal"
            required
            maxLength={200}
            placeholder="Contoh: Rapat Koordinasi Kebahasaan"
            className={inputCls}
          />
        </Field>

        <Field label="Tanggal" wajib error={err.tanggal}>
          <input
            type="date"
            name="tanggal"
            required
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Jam Mulai" wajib error={err.jamMulai}>
            <input
              type="time"
              name="jamMulai"
              required
              value={jamMulai}
              onChange={(e) => setJamMulai(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Jam Selesai" wajib error={err.jamSelesai}>
            <input
              type="time"
              name="jamSelesai"
              required
              value={jamSelesai}
              onChange={(e) => setJamSelesai(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <ConflictBadge bentrok={bentrok} />

        {bentrok.length > 0 && (
          <label className="flex items-start gap-2.5 text-[13px] font-medium text-slate-700">
            <input
              type="checkbox"
              name="izinkanBentrok"
              checked={izinkan}
              onChange={(e) => setIzinkan(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-red-600"
            />
            Saya sudah memeriksa dan tetap ingin menyimpan agenda yang bentrok
            ini.
          </label>
        )}

        <Field label="Tempat" wajib error={err.lokasi}>
          <input
            name="lokasi"
            required
            maxLength={200}
            placeholder="Contoh: Novotel Bukittinggi"
            className={inputCls}
          />
        </Field>
      </section>

      {/* Kolom opsional */}
      <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-[15px] font-extrabold tracking-tight">
            Informasi Tambahan
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Opsional. Boleh dilengkapi nanti.
          </p>
        </div>

        <Field label="Pengundang / Penyelenggara" error={err.pengirim}>
          <input name="pengirim" maxLength={200} className={inputCls} />
        </Field>
        <Field label="Nomor Surat" error={err.nomorSurat}>
          <input name="nomorSurat" maxLength={150} className={inputCls} />
        </Field>
        <Field label="Pakaian" error={err.pakaian}>
          <input
            name="pakaian"
            maxLength={100}
            placeholder="Contoh: Batik lengan panjang"
            className={inputCls}
          />
        </Field>
        <Field label="Pendamping" error={err.pendamping}>
          <input name="pendamping" maxLength={200} className={inputCls} />
        </Field>
        <Field label="Link Google Maps" error={err.linkMaps}>
          <input
            type="url"
            name="linkMaps"
            maxLength={500}
            placeholder="https://maps.google.com/..."
            className={inputCls}
          />
        </Field>
        <Field label="Catatan" error={err.catatan}>
          <textarea
            name="catatan"
            rows={3}
            maxLength={1000}
            className={inputCls}
          />
        </Field>

        <label className="flex items-start gap-2.5 text-[13px] font-medium text-slate-700">
          <input
            type="checkbox"
            name="isSensitive"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-primary"
          />
          <span>
            Tandai sensitif / tertutup
            <span className="block text-xs font-normal text-slate-400">
              Judul disamarkan bagi pegawai umum.
            </span>
          </span>
        </label>
      </section>

      {/* Bar tombol */}
      <div
        className="sticky bottom-0 -mx-5 border-t border-slate-100 bg-white/95 px-5 pt-3 backdrop-blur"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {err.form && (
          <p className="mb-2 text-xs font-semibold text-red-600">{err.form}</p>
        )}
        <button
          type="submit"
          disabled={pending || terkunci}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-primary py-3.5 text-[15px] font-bold text-white transition-all hover:bg-brand-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending
            ? "Menyimpan..."
            : bentrok.length > 0
              ? "Simpan Meski Bentrok"
              : "Simpan Agenda"}
        </button>
      </div>
    </form>
  );
}
