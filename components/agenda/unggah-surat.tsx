"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";
import { catatLampiran } from "@/lib/actions/lampiran";
import {
  BUCKET_SURAT,
  EKSTENSI,
  MAKS_UKURAN_BYTE,
  MIME_DIIZINKAN,
} from "@/lib/lampiran-config";
import { createClient } from "@/lib/supabase/client";

function idAcak() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  );
}

/** Foto dari kamera HP sering > 5 MB: kecilkan ke maks. 2200 px, JPEG */
async function kecilkan(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= 1.5 * 1024 * 1024) {
    return file;
  }
  try {
    const bmp = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const skala = Math.min(1, 2200 / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * skala);
    const h = Math.round(bmp.height * skala);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff"; // PNG transparan -> latar putih
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", 0.85),
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } catch {
    return file; // browser tidak mendukung: pakai berkas asli
  }
}

export function UnggahSurat({ agendaId }: { agendaId: number }) {
  const router = useRouter();
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);

  async function onPilih(e: ChangeEvent<HTMLInputElement>) {
    const asli = e.target.files?.[0];
    e.target.value = ""; // agar berkas yang sama bisa dipilih ulang
    if (!asli) return;

    setPesan(null);
    if (!(MIME_DIIZINKAN as readonly string[]).includes(asli.type)) {
      setPesan("Format harus PDF, JPG, atau PNG.");
      return;
    }

    setSibuk(true);
    try {
      const file = await kecilkan(asli);
      if (file.size > MAKS_UKURAN_BYTE) {
        setPesan(
          `Ukuran berkas ${(file.size / 1048576).toFixed(1)} MB, melebihi batas 5 MB.` +
            (file.type === "application/pdf"
              ? " Kompres PDF terlebih dahulu."
              : ""),
        );
        return;
      }

      const path = `agenda-${agendaId}/${idAcak()}.${EKSTENSI[file.type]}`;
      const supabase = createClient();

      const { error } = await supabase.storage
        .from(BUCKET_SURAT)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        setPesan(`Gagal mengunggah: ${error.message}`);
        return;
      }

      const hasil = await catatLampiran(agendaId, path, asli.name);
      if (hasil.error) {
        await supabase.storage.from(BUCKET_SURAT).remove([path]); // bersihkan yatim
        setPesan(hasil.error);
        return;
      }

      router.refresh();
    } catch {
      setPesan("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="mt-3">
      <label
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-brand-primary/40 bg-white/70 py-3.5 text-[14px] font-bold text-brand-primary transition-colors hover:bg-brand-mint ${
          sibuk ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {sibuk ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <FileUp className="h-5 w-5" />
        )}
        {sibuk ? "Mengunggah..." : "Unggah Scan Surat"}
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={onPilih}
          disabled={sibuk}
          className="sr-only"
        />
      </label>
      <p className="mt-1.5 text-center text-[11px] text-slate-400">
        PDF, JPG, atau PNG. Maksimal 5 MB.
      </p>
      {pesan && (
        <p
          role="alert"
          className="mt-1.5 text-center text-xs font-semibold text-red-600"
        >
          {pesan}
        </p>
      )}
    </div>
  );
}
