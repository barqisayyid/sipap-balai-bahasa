import { List } from "lucide-react";
import { LiveClock } from "@/components/layout/live-clock";
import { AgendaListView } from "@/components/agenda/agenda-list-view";
import { bolehKelolaAgenda, getProfil } from "@/lib/auth";
import { getDaftarAgenda, type FilterAgenda } from "@/lib/data/agenda";
import { dateKeyWIB, getNow } from "@/lib/date";

const FILTER_KEYS: FilterAgenda[] = ["mendatang", "menunggu", "semua"];

export default async function DaftarAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter: FilterAgenda = FILTER_KEYS.includes(sp.filter as FilterAgenda)
    ? (sp.filter as FilterAgenda)
    : "mendatang";

  const now = getNow();
  const profil = await getProfil();
  const bolehKelola = !!profil && bolehKelolaAgenda(profil.role);
  const hariIniKey = dateKeyWIB(now);
  const daftar = await getDaftarAgenda(filter, now);

  return (
    <div className="px-5 pt-5 pb-24">
      <section className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-brand-primary">
            <List className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight text-slate-900">
              Daftar Agenda
            </h1>
            <p className="text-[11px] text-slate-500">
              {daftar.length} agenda terdata
            </p>
          </div>
        </div>
        <LiveClock variant="header" />
      </section>

      <AgendaListView
        daftarAwal={daftar}
        filterAktif={filter}
        hariIniKey={hariIniKey}
        bolehKelola={bolehKelola}
      />
    </div>
  );
}
