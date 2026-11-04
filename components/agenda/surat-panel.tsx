import { FileText, Image as IkonGambar, Lock } from "lucide-react";
import { HapusSurat } from "@/components/agenda/hapus-surat";
import { UnggahSurat } from "@/components/agenda/unggah-surat";
import type { Lampiran } from "@/lib/data/lampiran";
import { formatUkuran } from "@/lib/format";
import { MAKS_LAMPIRAN } from "@/lib/lampiran-config";

export function SuratPanel({
  agendaId,
  lampiran,
  bolehKelola,
  sensitif,
}: {
  agendaId: number;
  lampiran: Lampiran[];
  bolehKelola: boolean;
  sensitif: boolean;
}) {
  return (
    <section className="mt-5">
      <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">
        Surat Undangan
      </h2>

      {sensitif ? (
        <p className="mt-2 flex items-start gap-2 rounded-2xl bg-slate-100 p-3.5 text-[13px] leading-snug text-slate-500">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          Agenda ini ditandai sensitif, sehingga berkas surat tidak disimpan di
          sistem.
        </p>
      ) : (
        <>
          {lampiran.length === 0 ? (
            <p className="mt-1 text-[13.5px] text-slate-500">
              Belum ada berkas surat.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {lampiran.map((l) => {
                const gambar = l.mime.startsWith("image/");
                const Ikon = gambar ? IkonGambar : FileText;
                return (
                  <li
                    key={l.id}
                    className="flex items-center gap-1 rounded-2xl border border-slate-100 bg-white p-2 pr-1 shadow-sm"
                  >
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5 hover:bg-slate-50"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF7EE] text-brand-primary">
                        <Ikon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13.5px] font-semibold text-slate-800">
                          {l.namaFile}
                        </span>
                        <span className="block text-[11.5px] text-slate-400">
                          {formatUkuran(l.ukuranBytes)} · Ketuk untuk membuka
                        </span>
                      </span>
                    </a>
                    {bolehKelola && <HapusSurat id={l.id} nama={l.namaFile} />}
                  </li>
                );
              })}
            </ul>
          )}

          {bolehKelola && lampiran.length < MAKS_LAMPIRAN && (
            <UnggahSurat agendaId={agendaId} />
          )}

          {lampiran.length > 0 && (
            <p className="mt-2 text-[11px] text-slate-400">
              Tautan berkas berlaku 60 menit. Muat ulang halaman jika sudah
              kedaluwarsa.
            </p>
          )}
        </>
      )}
    </section>
  );
}
