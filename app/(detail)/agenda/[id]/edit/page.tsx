import { notFound, redirect } from "next/navigation";
import { BackButton } from "@/components/layout/back-button";
import { AgendaForm } from "@/components/forms/agenda-form";
import { bolehKelolaAgenda, wajibLogin } from "@/lib/auth";
import { getAgendaAktif, getAgendaById } from "@/lib/data/agenda";

export default async function EditAgendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profil = await wajibLogin();
  if (!bolehKelolaAgenda(profil.role)) {
    redirect("/agenda");
  }

  const { id } = await params;
  const angka = Number(id);
  if (!Number.isInteger(angka)) notFound();

  const [agenda, agendaAktif] = await Promise.all([
    getAgendaById(angka),
    getAgendaAktif(),
  ]);

  if (!agenda) notFound();

  return (
    <div className="min-h-dvh bg-white">
      {/* Bar atas */}
      <nav className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-slate-100 bg-white/95 px-5 py-3 backdrop-blur-xs">
        <BackButton href={`/agenda/${agenda.id}`} fallback={`/agenda/${agenda.id}`} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[16px] font-semibold tracking-tight text-slate-900">
            Ubah Agenda
          </h1>
          <p className="truncate text-[11px] text-slate-500">
            {agenda.perihal}
          </p>
        </div>
      </nav>

      <main className="px-5 py-4 pb-16">
        <AgendaForm agendaAwal={agenda} agendaAktif={agendaAktif} />
      </main>
    </div>
  );
}
