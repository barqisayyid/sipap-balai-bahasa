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
    <main
      className="flex min-h-dvh flex-col items-center justify-between px-5 py-10 sm:py-12"
      style={{
        background:
          "linear-gradient(180deg, #E6F4EC 0%, #F5FAF7 45%, #FFFFFF 100%)",
      }}
    >
      {/* Bagian Atas: Logo & Identitas Aplikasi */}
      <div className="flex flex-col items-center text-center">
        <SipapLogo className="h-16 w-16" variant="symbol" />
        <h1 className="mt-4 text-[26px] font-black tracking-tight text-[#0F2438]">
          SIPAP
        </h1>
        <div className="mt-1.5 space-y-0.5 text-[13px] font-medium leading-relaxed text-slate-600">
          <p>Sistem Informasi Penjadwalan &amp; Agenda Pimpinan</p>
          <p>Balai Bahasa Provinsi Sumatera Barat</p>
        </div>
      </div>

      {/* Bagian Tengah: Kotak Card Form Login */}
      <div className="my-auto w-full max-w-[390px] rounded-[32px] border border-slate-100 bg-white p-7 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.08)] sm:p-8">
        <LoginForm
          pesanAwal={
            sp.error === "profil"
              ? "Akun Anda belum terdaftar di SIPAP atau sudah dinonaktifkan."
              : undefined
          }
        />
      </div>

      {/* Bagian Bawah: Hak Cipta */}
      <footer className="mt-8 text-center">
        <p className="text-[12px] font-medium text-slate-400">
          &copy; 2026 Balai Bahasa Provinsi Sumatera Barat
        </p>
      </footer>
    </main>
  );
}
