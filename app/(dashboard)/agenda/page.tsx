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
    <div className="px-5 pt-6 pb-24">
      <section className="mb-4 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5EE] text-brand-primary">
            <List className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#16201a]">
              Daftar Agenda
            </h1>
            <p className="text-[11.5px] font-semibold text-slate-400">
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
