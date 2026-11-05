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
          className={`flex items-center gap-1.5 rounded-xl bg-slate-100/70 px-2.5 py-1 text-slate-500 ${className}`}
        >
          <div className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="text-xs font-semibold tabular-nums">
            --:--{showSeconds ? ":--" : ""}
          </span>
          <span className="text-[10px] font-bold">WIB</span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 shadow-2xs ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <span className="text-[12px] font-semibold tabular-nums text-slate-500">
          --:--{showSeconds ? ":--" : ""}
        </span>
        <span className="text-[10px] font-semibold text-slate-500">WIB</span>
      </div>
    );
  }

  const { hh, mm, ss } = formatTime(time);

  if (variant === "card") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-slate-800 ${className}`}
        title="Waktu Indonesia Barat (WIB)"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
        {showIcon && <Clock className="h-3 w-3 text-slate-500" />}
        <span className="text-[12px] font-semibold tracking-tight tabular-nums text-slate-900">
          {hh}:{mm}
          {showSeconds && (
            <span className="text-slate-500">:{ss}</span>
          )}
        </span>
        <span className="text-[10px] font-semibold text-slate-600">
          WIB
        </span>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums text-slate-700 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
        {hh}:{mm}
        {showSeconds && `:${ss}`} WIB
      </span>
    );
  }

  // Default: Header Pill
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-slate-800 shadow-2xs ${className}`}
      title="Waktu Indonesia Barat (WIB)"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shrink-0" />

      {showIcon && <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />}

      <span className="text-[12px] font-semibold tracking-tight tabular-nums text-slate-900">
        {hh}:{mm}
        {showSeconds && <span className="text-slate-500">:{ss}</span>}
      </span>

      <span className="text-[10px] font-bold text-brand-primary">
        WIB
      </span>
    </div>
  );
}
