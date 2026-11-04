import Link from "next/link";
import { List } from "lucide-react";
import { AgendaCard } from "@/components/agenda/agenda-card";
import { getDaftarAgenda, type FilterAgenda } from "@/lib/data/agenda";
import { dateKeyWIB, formatTanggalPanjang, getNow } from "@/lib/date";
import type { Agenda } from "@/lib/types";

const FILTER: { kunci: FilterAgenda; label: string }[] = [
  { kunci: "mendatang", label: "Mendatang" },
  { kunci: "menunggu", label: "Belum Konfirmasi" },
  { kunci: "semua", label: "Semua" },
];

const PESAN_KOSONG: Record<FilterAgenda, string> = {
  mendatang: "Belum ada agenda mendatang.",
  menunggu: "Semua agenda sudah terkonfirmasi. 🎉",
  semua: "Belum ada agenda sama sekali.",
};

export default async function DaftarAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter: FilterAgenda = FILTER.some((f) => f.kunci === sp.filter)
    ? (sp.filter as FilterAgenda)
    : "mendatang";

  const now = getNow();
  const hariIniKey = dateKeyWIB(now);
  const daftar = await getDaftarAgenda(filter, now);

  // Kelompokkan per tanggal
  const kelompok = new Map<string, Agenda[]>();
  for (const a of daftar) {
    const k = dateKeyWIB(a.waktuMulai);
    kelompok.set(k, [...(kelompok.get(k) ?? []), a]);
  }

  return (
    <div className="px-5 pt-6">
      <section className="mb-4 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5EE] text-brand-primary">
            <List className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#16201a]">
            Daftar Agenda
          </h1>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {daftar.length} agenda
        </span>
      </section>

      {/* Filter */}
      <nav className="mb-5 flex gap-2 overflow-x-auto pb-1" aria-label="Filter">
        {FILTER.map((f) => {
          const on = f.kunci === filter;
          return (
            <Link
              key={f.kunci}
              href={`/agenda?filter=${f.kunci}`}
              aria-current={on ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                on
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {kelompok.size === 0 ? (
        <p className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500">
          {PESAN_KOSONG[filter]}
        </p>
      ) : (
        <div className="space-y-6">
          {[...kelompok.entries()].map(([key, items]) => (
            <section key={key}>
              <h2 className="mb-2.5 px-1 text-[13px] font-bold text-slate-500">
                {key === hariIniKey && (
                  <span className="mr-1.5 rounded-full bg-brand-mint px-2 py-0.5 text-[11px] text-brand-primary">
                    Hari Ini
                  </span>
                )}
                {formatTanggalPanjang(new Date(`${key}T12:00:00+07:00`))}
              </h2>
              <div className="space-y-3">
                {items.map((a) => (
                  <AgendaCard key={a.id} agenda={a} tampilTanggal={false} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
