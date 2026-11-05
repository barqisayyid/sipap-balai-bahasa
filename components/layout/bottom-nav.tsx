"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, List, Plus, User } from "lucide-react";

const TAB = [
  { href: "/", label: "Beranda", Ikon: Home },
  { href: "/kalender", label: "Kalender", Ikon: CalendarDays },
  null, // ruang kosong untuk tombol + di tengah
  { href: "/agenda", label: "Agenda", Ikon: List },
  { href: "/profil", label: "Profil", Ikon: User },
] as const;

function aktif(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav({ bolehTambah }: { bolehTambah: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu utama"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] rounded-t-2xl border-t border-slate-200/80 bg-white px-5 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
      style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))" }}
    >
      {/* Tombol tambah agenda (hanya operator & superadmin) */}
      {bolehTambah && (
        <Link
          href="/agenda/baru"
          aria-label="Tambah agenda baru"
          className="absolute -top-5 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-brand-primary text-white shadow-md shadow-slate-900/15 transition-colors hover:bg-brand-dark active:scale-[0.98]"
        >
          <Plus className="h-6 w-6" strokeWidth={2.2} />
        </Link>
      )}

      <div className="grid grid-cols-5 items-center text-center">
        {TAB.map((t, i) => {
          if (!t) return <div key={i} />;
          const on = aktif(pathname, t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={`flex flex-col items-center pt-1 transition-colors ${
                on
                  ? "text-brand-primary"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <t.Ikon className="h-5 w-5" strokeWidth={on ? 2.2 : 1.8} />
              <span
                className={`mt-1 text-[11px] ${on ? "font-semibold" : "font-normal"}`}
              >
                {t.label}
              </span>
              <span
                className={`mt-1 h-0.5 w-4 rounded-full ${
                  on ? "bg-brand-primary" : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
