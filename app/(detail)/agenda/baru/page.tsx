import { redirect } from "next/navigation";
import { AgendaForm } from "@/components/forms/agenda-form";
import { BackButton } from "@/components/layout/back-button";
import { bolehKelolaAgenda, wajibLogin } from "@/lib/auth";
import { getAgendaAktif } from "@/lib/data/agenda";
import { dateKeyWIB, getNow } from "@/lib/date";

export default async function AgendaBaruPage() {
  const profil = await wajibLogin();
  if (!bolehKelolaAgenda(profil.role)) redirect("/agenda");

  const aktif = await getAgendaAktif();
  const ringkas = aktif.map(
    ({ id, perihal, waktuMulai, waktuSelesai, status }) => ({
      id,
      perihal,
      waktuMulai,
      waktuSelesai,
      status,
    }),
  );

  return (
    <div className="bg-white min-h-dvh px-5 pb-8 pt-4">
      <header className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <BackButton fallback="/agenda" />
        <h1 className="text-[17px] font-semibold tracking-tight text-slate-900">
          Tambah Agenda Baru
        </h1>
      </header>

      <AgendaForm agendaAktif={ringkas} tanggalDefault={dateKeyWIB(getNow())} />
    </div>
  );
}
