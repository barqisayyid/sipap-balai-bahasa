import { BellRing } from "lucide-react";
import { AgendaCard } from "@/components/agenda/agenda-card";
import { StatusAksi } from "@/components/agenda/status-aksi";
import { bolehKelolaAgenda, statusBolehDiubah, wajibLogin } from "@/lib/auth";
import { getDaftarAgenda } from "@/lib/data/agenda";
import { getNow } from "@/lib/date";

export default async function AntreanKonfirmasiPage() {
  const profil = await wajibLogin();
  const bolehKelola = bolehKelolaAgenda(profil.role);
  const pilihan = statusBolehDiubah(profil.role).filter(
    (s) => s === "Hadir" || s === "Didisposisikan",
  );
  const daftar = await getDaftarAgenda("menunggu", getNow());

  return (
    <div className="px-5 pt-5 pb-24">
      <section className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold leading-tight tracking-tight text-slate-900">
              Antrean Konfirmasi
            </h1>
            <p className="text-[11px] text-slate-500">
              Agenda yang menunggu tanggapan kehadiran
            </p>
          </div>
        </div>
        <span className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
          {daftar.length} agenda
        </span>
      </section>

      {daftar.length === 0 ? (
        <p className="rounded-xl border border-slate-200/80 bg-white p-6 text-center text-sm font-medium text-slate-500">
          Semua agenda sudah terkonfirmasi.
        </p>
      ) : (
        <div className="space-y-4">
          {daftar.map((a) => (
            <div key={a.id} className="space-y-1">
              <AgendaCard agenda={a} bolehKelola={bolehKelola} />
              {pilihan.length > 0 && (
                <div className="px-0.5">
                  <StatusAksi agendaId={a.id} pilihan={pilihan} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
