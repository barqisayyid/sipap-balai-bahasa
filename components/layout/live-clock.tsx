"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface LiveClockProps {
  variant?: "header" | "card" | "badge";
  showSeconds?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function LiveClock({
  variant = "header",
  showSeconds = true,
  showIcon = false,
  className = "",
}: LiveClockProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format jam menurut WIB (Asia/Jakarta)
  const formatTime = (d: Date) => {
    const parts = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hourCycle: "h23",
    }).formatToParts(d);

    const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    const ss = parts.find((p) => p.type === "second")?.value ?? "00";

    return { hh, mm, ss };
  };

  if (!mounted || !time) {
    // Skeleton placeholder untuk mencegah layout shift dan hydration mismatch
    if (variant === "card") {
      return (
        <div
          className={`flex items-center gap-1.5 rounded-xl bg-slate-100/70 px-2.5 py-1 text-slate-400 ${className}`}
        >
          <div className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="font-mono text-xs font-bold tabular-nums">
            --:--{showSeconds ? ":--" : ""}
          </span>
          <span className="text-[10px] font-bold">WIB</span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 shadow-2xs backdrop-blur-xs ${className}`}
      >
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="font-mono text-[12px] font-bold tabular-nums text-slate-400">
          --:--{showSeconds ? ":--" : ""}
        </span>
        <span className="text-[10px] font-bold text-slate-400">WIB</span>
      </div>
    );
  }

  const { hh, mm, ss } = formatTime(time);

  if (variant === "card") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-2.5 py-1 text-emerald-900 shadow-2xs ${className}`}
        title="Waktu Indonesia Barat (WIB)"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        {showIcon && <Clock className="h-3 w-3 text-emerald-700" />}
        <span className="font-mono text-[12px] font-extrabold tracking-tight tabular-nums text-emerald-950">
          {hh}:{mm}
          {showSeconds && (
            <span className="text-emerald-700">:{ss}</span>
          )}
        </span>
        <span className="text-[10px] font-extrabold tracking-wider text-emerald-700">
          WIB
        </span>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono text-xs font-bold tabular-nums text-slate-700 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {hh}:{mm}
        {showSeconds && `:${ss}`} WIB
      </span>
    );
  }

  // Default: Header Pill
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/95 px-2.5 py-1 text-slate-800 shadow-xs backdrop-blur-xs transition-all ${className}`}
      title="Waktu Indonesia Barat (WIB)"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
      </span>

      {showIcon && <Clock className="h-3.5 w-3.5 text-brand-primary shrink-0" />}

      <span className="font-mono text-[12.5px] font-extrabold tracking-tight tabular-nums text-slate-800">
        {hh}:{mm}
        {showSeconds && <span className="text-slate-500">:{ss}</span>}
      </span>

      <span className="text-[10px] font-extrabold tracking-wider text-brand-primary">
        WIB
      </span>
    </div>
  );
}
