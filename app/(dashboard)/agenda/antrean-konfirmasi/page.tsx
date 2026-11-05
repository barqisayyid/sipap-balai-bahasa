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
    <div className="px-5 pt-6">
      <section className="mb-5 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-amber-light text-[#EA580C]">
            <BellRing className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-[#16201a]">
              Antrean Konfirmasi
            </h1>
            <p className="text-xs text-slate-500">
              Agenda yang belum ditanggapi pimpinan
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {daftar.length} agenda
        </span>
      </section>

      {daftar.length === 0 ? (
        <p className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500">
          Semua agenda sudah terkonfirmasi.
        </p>
      ) : (
        <div className="space-y-5">
          {daftar.map((a) => (
            <div key={a.id}>
              <AgendaCard agenda={a} bolehKelola={bolehKelola} />
              {pilihan.length > 0 && (
                <div className="px-1">
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
