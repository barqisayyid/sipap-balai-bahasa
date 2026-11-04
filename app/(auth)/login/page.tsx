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
    <div
      className="flex min-h-dvh flex-col justify-center px-7 py-10"
      style={{
        background:
          "linear-gradient(180deg, #E3F3EA 0%, rgba(247,250,248,0) 60%)",
      }}
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <SipapLogo className="h-16 w-16" />
        <h1 className="mt-4 text-[28px] font-extrabold tracking-tight">
          SIPAP
        </h1>
        <p className="mt-1 text-[13px] font-medium text-slate-500">
          Sistem Informasi Penjadwalan &amp; Agenda Pimpinan
          <br />
          Balai Bahasa Provinsi Sumatera Barat
        </p>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.05)]">
        <LoginForm
          pesanAwal={
            sp.error === "profil"
              ? "Akun Anda belum terdaftar di SIPAP atau sudah dinonaktifkan."
              : undefined
          }
        />
      </div>
    </div>
  );
}
