import type { StatusAgenda } from "@/lib/types";

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
