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
    cls: "bg-brand-mint text-brand-primary border-[#D5EFE0]",
    Ikon: CheckCircle2,
  },
  PENDING: {
    label: "Menunggu",
    cls: "bg-brand-amber-light text-[#EA580C] border-[#FEDDC3]",
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
    <div className="px-5 pt-6">
      <section className="mb-4 mt-2 flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5EE] text-brand-primary">
          <Send className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight tracking-tight">
            Log Notifikasi
          </h1>
          <p className="text-xs text-slate-500">100 pesan terakhir</p>
        </div>
      </section>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        {(["SUCCESS", "PENDING", "FAILED"] as const).map((s) => (
          <div
            key={s}
            className={`rounded-2xl border px-2 py-3 ${STATUS[s].cls}`}
          >
            <p className="text-[22px] font-extrabold leading-none">
              {hitung(s)}
            </p>
            <p className="mt-1 text-[11px] font-semibold">{STATUS[s].label}</p>
          </div>
        ))}
      </div>

      <form action={kirimUji} className="mb-2">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-brand-primary py-3 text-[14px] font-bold text-brand-primary transition-all hover:bg-brand-primary/5 active:scale-[0.99]"
        >
          <Send className="h-4 w-4" />
          Kirim pesan uji ke nomor saya
        </button>
      </form>
      {sp.uji === "ok" && (
        <p className="mb-3 text-center text-xs font-semibold text-brand-primary">
          Pesan uji diterima Fonnte. Periksa WhatsApp Anda.
        </p>
      )}
      {sp.uji === "gagal" && (
        <p
          role="alert"
          className="mb-3 text-center text-xs font-semibold text-red-600"
        >
          Gagal: {sp.alasan ?? "tidak diketahui"}
        </p>
      )}

      {daftar.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white p-5 text-center text-sm text-slate-500">
          Belum ada pesan.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {daftar.map((d) => {
            const s = STATUS[d.status] ?? STATUS.PENDING;
            return (
              <li
                key={d.id}
                className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-800">
                      {TIPE[d.tipe] ?? d.tipe}
                    </p>
                    {perihalDari(d.agenda) && (
                      <p className="truncate text-xs text-slate-500">
                        {perihalDari(d.agenda)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}
                  >
                    <s.Ikon className="h-3 w-3" />
                    {s.label}
                  </span>
                </div>
                <p className="mt-1.5 text-[11.5px] text-slate-400">
                  {samarkan(d.nomor_tujuan)} ·{" "}
                  {formatTanggalSingkat(d.sent_at ?? d.jadwal_kirim)}{" "}
                  {formatJam(d.sent_at ?? d.jadwal_kirim)}
                  {d.percobaan_ke > 1 && ` · percobaan ke-${d.percobaan_ke}`}
                </p>
                {d.pesan_error && (
                  <p className="mt-1 text-[11.5px] font-medium text-red-600">
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
