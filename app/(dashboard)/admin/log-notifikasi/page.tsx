import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Send, XCircle } from "lucide-react";
import { kirimUji } from "@/lib/actions/notif";
import { wajibLogin } from "@/lib/auth";
import { formatJam, formatTanggalSingkat } from "@/lib/date";
import { createAdminClient } from "@/lib/supabase/admin";

const TIPE: Record<string, string> = {
  INSTANT_NEW: "Agenda baru",
  REKAP_PAGI: "Rekap pagi",
  REMINDER_H1: "Pengingat H-1",
  REMINDER_2JAM: "Pengingat 2 jam",
  ESKALASI_PEMANTAU: "Eskalasi H-1",
  ESKALASI_ADMIN: "Darurat",
};

const STATUS = {
  SUCCESS: {
    label: "Terkirim",
    cls: "bg-emerald-50/80 text-brand-primary border-emerald-200/80",
    Ikon: CheckCircle2,
  },
  PENDING: {
    label: "Menunggu",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    Ikon: Clock,
  },
  FAILED: {
    label: "Gagal",
    cls: "bg-red-50 text-red-700 border-red-200",
    Ikon: XCircle,
  },
} as const;

type KunciStatus = keyof typeof STATUS;

interface Baris {
  id: number;
  tipe: string;
  status: KunciStatus;
  nomor_tujuan: string;
  jadwal_kirim: string;
  sent_at: string | null;
  percobaan_ke: number;
  pesan_error: string | null;
  agenda: { perihal: string } | { perihal: string }[] | null;
}

const samarkan = (n: string) =>
  n.length > 8 ? `${n.slice(0, 5)}••••${n.slice(-3)}` : n;

const perihalDari = (a: Baris["agenda"]) =>
  Array.isArray(a) ? a[0]?.perihal : a?.perihal;

export default async function LogNotifikasiPage({
  searchParams,
}: {
  searchParams: Promise<{ uji?: string; alasan?: string }>;
}) {
  const profil = await wajibLogin();
  if (profil.role !== "superadmin") redirect("/");
  const sp = await searchParams;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifikasi_log")
    .select(
      "id, tipe, status, nomor_tujuan, jadwal_kirim, sent_at, percobaan_ke, pesan_error, agenda:agenda_pimpinan(perihal)",
    )
    .order("id", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Database: ${error.message}`);

  const daftar = (data ?? []) as unknown as Baris[];
  const hitung = (s: KunciStatus) =>
    daftar.filter((d) => d.status === s).length;

  return (
    <div className="px-5 pt-5 pb-24">
      <section className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-brand-primary">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[17px] font-semibold leading-tight tracking-tight text-slate-900">
            Log Notifikasi
          </h1>
          <p className="text-[11px] text-slate-500">100 pengiriman pesan WhatsApp terakhir</p>
        </div>
      </section>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        {(["SUCCESS", "PENDING", "FAILED"] as const).map((s) => (
          <div
            key={s}
            className={`rounded-xl border px-2 py-2.5 ${STATUS[s].cls}`}
          >
            <p className="text-[18px] font-semibold leading-none tabular-nums">
              {hitung(s)}
            </p>
            <p className="mt-1 text-[11px] font-medium">{STATUS[s].label}</p>
          </div>
        ))}
      </div>

      <form action={kirimUji} className="mb-2">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white py-2.5 text-[13px] font-medium text-slate-750 hover:bg-slate-50 transition-colors active:scale-[0.98]"
        >
          <Send className="h-3.5 w-3.5 text-brand-primary" />
          Kirim pesan uji ke nomor saya
        </button>
      </form>
      {sp.uji === "ok" && (
        <p className="mb-3 text-center text-xs font-medium text-brand-primary">
          Pesan uji diterima Fonnte. Periksa WhatsApp Anda.
        </p>
      )}
      {sp.uji === "gagal" && (
        <p
          role="alert"
          className="mb-3 text-center text-xs font-medium text-red-600"
        >
          Gagal: {sp.alasan ?? "tidak diketahui"}
        </p>
      )}

      {daftar.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200/80 bg-white p-5 text-center text-sm font-medium text-slate-500">
          Belum ada pesan.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {daftar.map((d) => {
            const s = STATUS[d.status] ?? STATUS.PENDING;
            return (
              <li
                key={d.id}
                className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900">
                      {TIPE[d.tipe] ?? d.tipe}
                    </p>
                    {perihalDari(d.agenda) && (
                      <p className="truncate text-[12px] text-slate-500 mt-0.5">
                        {perihalDari(d.agenda)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium ${s.cls}`}
                  >
                    <s.Ikon className="h-3 w-3" />
                    {s.label}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] font-medium tabular-nums text-slate-500">
                  {samarkan(d.nomor_tujuan)} ·{" "}
                  {formatTanggalSingkat(d.sent_at ?? d.jadwal_kirim)}{" "}
                  {formatJam(d.sent_at ?? d.jadwal_kirim)}
                  {d.percobaan_ke > 1 && ` · percobaan ke-${d.percobaan_ke}`}
                </p>
                {d.pesan_error && (
                  <p className="mt-1 text-[11px] font-medium text-red-600">
                    {d.pesan_error}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
