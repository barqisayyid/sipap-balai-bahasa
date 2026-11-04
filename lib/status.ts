import type { StatusAgenda } from "@/lib/types";
import { getNow } from "@/lib/date";

export type FaseWaktuAgenda = "akan-datang" | "berlangsung" | "selesai";

export interface InfoStatusLifecycle {
  labelRingkas: string;
  labelLengkap: string;
  keterangan: string;
  fase?: FaseWaktuAgenda;
  badgeCls: string;
  ikon:
    | "CheckCircle2"
    | "CheckCheck"
    | "Clock"
    | "CornerUpRight"
    | "XCircle"
    | "live-dot";
}

export const STATUS_STYLE: Record<
  StatusAgenda,
  {
    accent: string;
    iconBox: string;
    badge: string;
    dot: string;
    card: string;
    circle: string;
    teks: string;
  }
> = {
  Hadir: {
    accent: "bg-brand-primary",
    iconBox: "bg-[#EAF7EE] text-brand-primary",
    badge: "bg-brand-mint text-brand-primary border-[#D5EFE0]",
    dot: "bg-brand-primary",
    card: "bg-[#f0f8f4]",
    circle: "bg-[#136a3e]",
    teks: "text-[#115e37]",
  },
  "Menunggu Konfirmasi": {
    accent: "bg-brand-accent",
    iconBox: "bg-[#FFF3E8] text-[#EA580C]",
    badge: "bg-brand-amber-light text-[#EA580C] border-[#FEDDC3]",
    dot: "bg-amber-500",
    card: "bg-[#FFF6EC]",
    circle: "bg-[#EA580C]",
    teks: "text-[#C2410C]",
  },
  Didisposisikan: {
    accent: "bg-sky-600",
    iconBox: "bg-sky-50 text-sky-700",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-600",
    card: "bg-sky-50",
    circle: "bg-sky-600",
    teks: "text-sky-800",
  },
  Batal: {
    accent: "bg-red-500",
    iconBox: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    card: "bg-red-50",
    circle: "bg-red-600",
    teks: "text-red-700",
  },
};

/**
 * Menghitung fase waktu kegiatan relatif terhadap waktu saat ini (WIB)
 */
export function getFaseAgenda(
  waktuMulai: string | Date,
  waktuSelesai: string | Date,
  now = getNow(),
): FaseWaktuAgenda {
  const tNow = now.getTime();
  const tMulai = new Date(waktuMulai).getTime();
  const tSelesai = new Date(waktuSelesai).getTime();

  if (tNow < tMulai) return "akan-datang";
  if (tNow >= tMulai && tNow <= tSelesai) return "berlangsung";
  return "selesai";
}

/**
 * Memberikan informasi status cerdas (Lifecycle Status) yang menyesuaikan
 * label dan ikon berdasarkan apakah agenda belum mulai, sedang berjalan, atau telah selesai dihadiri.
 */
export function getInfoStatusLifecycle(
  status: StatusAgenda,
  waktuMulai?: string | Date,
  waktuSelesai?: string | Date,
  now = getNow(),
): InfoStatusLifecycle {
  const fase =
    waktuMulai && waktuSelesai
      ? getFaseAgenda(waktuMulai, waktuSelesai, now)
      : undefined;

  // 1. Kasus BATAL
  if (status === "Batal") {
    return {
      labelRingkas: "Batal",
      labelLengkap: "Dibatalkan",
      keterangan: "Kegiatan ini telah dibatalkan.",
      fase,
      badgeCls: "bg-red-50 text-red-700 border-red-200",
      ikon: "XCircle",
    };
  }

  // 2. Kasus MENUNGGU KONFIRMASI
  if (status === "Menunggu Konfirmasi") {
    if (fase === "selesai") {
      return {
        labelRingkas: "Lewat Waktu",
        labelLengkap: "Lewat Waktu (Belum Dikonfirmasi)",
        keterangan:
          "Waktu pelaksanaan kegiatan telah berlalu tanpa ada konfirmasi kehadiran.",
        fase,
        badgeCls: "bg-slate-100 text-slate-500 border-slate-200",
        ikon: "Clock",
      };
    }
    return {
      labelRingkas: "Menunggu Konfirmasi",
      labelLengkap: "Menunggu Konfirmasi",
      keterangan: "Menunggu konfirmasi kesediaan kehadiran dari pimpinan.",
      fase,
      badgeCls: "bg-brand-amber-light text-[#EA580C] border-[#FEDDC3]",
      ikon: "Clock",
    };
  }

  // 3. Kasus DIDISPOSISIKAN
  if (status === "Didisposisikan") {
    if (fase === "selesai") {
      return {
        labelRingkas: "Selesai",
        labelLengkap: "Selesai (Didisposisikan)",
        keterangan:
          "Kegiatan telah selesai dihadiri melalui perwakilan yang didisposisikan.",
        fase,
        badgeCls: "bg-sky-50 text-sky-800 border-sky-200/90",
        ikon: "CheckCheck",
      };
    }
    if (fase === "berlangsung") {
      return {
        labelRingkas: "Berlangsung",
        labelLengkap: "Sedang Berlangsung (Disposisi)",
        keterangan:
          "Kegiatan sedang berlangsung oleh staf/pejabat yang ditugaskan.",
        fase,
        badgeCls: "bg-sky-100 text-sky-800 border-sky-300 font-bold",
        ikon: "live-dot",
      };
    }
    return {
      labelRingkas: "Didisposisikan",
      labelLengkap: "Didisposisikan",
      keterangan: "Agenda didelegasikan kepada perwakilan yang ditugaskan.",
      fase,
      badgeCls: "bg-sky-50 text-sky-700 border-sky-200",
      ikon: "CornerUpRight",
    };
  }

  // 4. Kasus HADIR
  if (fase === "selesai") {
    return {
      labelRingkas: "Selesai",
      labelLengkap: "Selesai Dihadiri",
      keterangan:
        "Agenda telah selesai dilaksanakan dan dihadiri oleh Kepala Balai.",
      fase,
      badgeCls: "bg-[#EBF7EE] text-[#0A5C36] border-[#CEEBD6]",
      ikon: "CheckCheck",
    };
  }
  if (fase === "berlangsung") {
    return {
      labelRingkas: "Berlangsung",
      labelLengkap: "Sedang Berlangsung",
      keterangan:
        "Agenda sedang berlangsung saat ini dan sedang dihadiri oleh Kepala Balai.",
      fase,
      badgeCls: "bg-emerald-100 text-[#0A5C36] border-emerald-300 font-bold",
      ikon: "live-dot",
    };
  }
  return {
    labelRingkas: "Akan Hadir",
    labelLengkap: "Terkonfirmasi Hadir",
    keterangan: "Kepala Balai terkonfirmasi bersedia menghadiri agenda ini.",
    fase,
    badgeCls: "bg-brand-mint text-brand-primary border-[#D5EFE0]",
    ikon: "CheckCircle2",
  };
}
