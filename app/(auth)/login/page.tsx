import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { SipapLogo } from "@/components/layout/sipap-logo";
import { getProfil } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getProfil()) redirect("/");
  const sp = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-between bg-white px-5 py-8 sm:py-10">
      {/* Bagian Atas: Logo & Identitas Aplikasi */}
      <div className="flex flex-col items-center text-center pt-2">
        <SipapLogo className="h-14 w-14" variant="symbol" />
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-slate-900">
          SIPAP
        </h1>
        <div className="mt-1 space-y-0.5 text-[12.5px] font-medium text-slate-600">
          <p>Sistem Informasi Penjadwalan &amp; Agenda Pimpinan</p>
          <p className="text-slate-500">Balai Bahasa Provinsi Sumatera Barat</p>
        </div>
      </div>

      {/* Bagian Tengah: Kotak Card Form Login */}
      <div className="my-auto w-full max-w-[380px] rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <LoginForm
          pesanAwal={
            sp.error === "profil"
              ? "Akun Anda belum terdaftar di SIPAP atau sudah dinonaktifkan."
              : undefined
          }
        />
      </div>

      {/* Bagian Bawah: Hak Cipta */}
      <footer className="mt-6 text-center">
        <p className="text-[11.5px] text-slate-400">
          &copy; 2026 Balai Bahasa Provinsi Sumatera Barat
        </p>
      </footer>
    </main>
  );
}
