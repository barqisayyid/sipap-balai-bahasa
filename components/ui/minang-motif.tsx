interface MinangWatermarkProps {
  className?: string;
  opacity?: number;
  color?: "white" | "emerald" | string;
  fadeLeft?: boolean;
}

/**
 * Watermark ukiran ornamen tradisional Minangkabau (berdasarkan motif otentik pada image.svg).
 * Digunakan sebagai aksen tekstur berwibawa pada kartu agenda pimpinan dan naskah dinas.
 */
export function MinangWatermark({
  className = "pointer-events-none absolute inset-0 overflow-hidden",
  opacity = 0.13,
  color = "white",
  fadeLeft = true,
}: MinangWatermarkProps) {
  const isEmerald = color === "emerald" || color === "#0A5C36";

  const webpSrc = isEmerald
    ? "/images/motif-minang-emerald.webp"
    : "/images/motif-minang.webp";
  const pngSrc = isEmerald
    ? "/images/motif-minang-emerald.png"
    : "/images/motif-minang.png";

  const maskStyle = fadeLeft
    ? {
        maskImage:
          "linear-gradient(to right, transparent 0%, transparent 25%, black 70%, black 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, transparent 25%, black 70%, black 100%)",
      }
    : undefined;

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ opacity, ...maskStyle }}
    >
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={pngSrc}
          alt=""
          className="h-full w-full object-cover object-right select-none pointer-events-none"
          loading="eager"
        />
      </picture>
    </div>
  );
}

/**
 * Garis pembatas ganda (*Double-Hairline Rule*) resmi khas naskah dinas kenegaraan RI.
 */
export function DoubleHairlineRule({
  className = "my-3",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark" | "gold";
}) {
  const primaryColor =
    variant === "light"
      ? "bg-white/25"
      : variant === "gold"
        ? "bg-amber-400/40"
        : "bg-slate-300";

  const secondaryColor =
    variant === "light"
      ? "bg-white/15"
      : variant === "gold"
        ? "bg-amber-400/20"
        : "bg-slate-200";

  return (
    <div className={`space-y-[2px] ${className}`} aria-hidden="true">
      <div className={`h-[1.5px] w-full rounded-full ${primaryColor}`} />
      <div className={`h-[0.75px] w-full rounded-full ${secondaryColor}`} />
    </div>
  );
}

/**
 * Stempel kedinasan (*Official Seal*) untuk menandai status agenda resmi pimpinan.
 */
export function CapStempelKedinasan({
  status,
  className = "",
}: {
  status: "Hadir" | "Diwakilkan" | "Menunggu" | "Batal" | string;
  className?: string;
}) {
  const isHadir = status.toLowerCase() === "hadir";
  const isDiwakilkan = status.toLowerCase() === "diwakilkan";
  const isBatal = status.toLowerCase() === "batal";

  const borderColor = isHadir
    ? "border-emerald-700/80 text-emerald-800 bg-emerald-50/50"
    : isDiwakilkan
      ? "border-amber-700/80 text-amber-800 bg-amber-50/50"
      : isBatal
        ? "border-red-700/80 text-red-800 bg-red-50/50"
        : "border-slate-500/80 text-slate-700 bg-slate-50/50";

  const ringColor = isHadir
    ? "border-emerald-600/40"
    : isDiwakilkan
      ? "border-amber-600/40"
      : isBatal
        ? "border-red-600/40"
        : "border-slate-400/40";

  const label = isHadir
    ? "DIHADIRI KEPALA"
    : isDiwakilkan
      ? "TERDISPOSISI"
      : isBatal
        ? "DIBATALKAN"
        : "KONFIRMASI";

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center -rotate-3 select-none rounded-sm border-2 px-3 py-1 font-sans font-bold tracking-wider ${borderColor} ${className}`}
      aria-label={`Stempel status: ${label}`}
    >
      {/* Garis batas dalam stempel stempel */}
      <div
        className={`pointer-events-none absolute inset-0.5 rounded-[2px] border ${ringColor}`}
      />
      <span className="text-[8.5px] font-semibold leading-none tracking-widest uppercase opacity-75">
        BALAI BAHASA SUMBAR
      </span>
      <span className="my-0.5 text-[11.5px] font-extrabold leading-none tracking-widest uppercase">
        {label}
      </span>
      <span className="text-[7.5px] font-medium leading-none tracking-tight opacity-75">
        AGENDA RESMI
      </span>
    </div>
  );
}
