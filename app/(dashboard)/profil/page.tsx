import { LogOut, Phone, ShieldCheck, User } from "lucide-react";
import { LABEL_ROLE, wajibLogin } from "@/lib/auth";
import { keluar } from "@/lib/actions/auth";

export default async function ProfilPage() {
  const profil = await wajibLogin();

  return (
    <div className="px-5 pt-6">
      <section className="mb-5 mt-2 flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F5EE] text-brand-primary">
          <User className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#16201a]">
          Profil
        </h1>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-[22px] font-extrabold tracking-tight">
          {profil.fullName}
        </p>
        <dl className="mt-4 space-y-3 text-[14px]">
          <div className="flex items-center gap-3 text-slate-700">
            <ShieldCheck className="h-5 w-5 text-slate-400" />
            <dt className="sr-only">Peran</dt>
            <dd className="font-semibold">{LABEL_ROLE[profil.role]}</dd>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Phone className="h-5 w-5 text-slate-400" />
            <dt className="sr-only">Nomor WhatsApp</dt>
            <dd className="font-semibold">{profil.phone}</dd>
          </div>
        </dl>
      </section>

      <form action={keluar} className="mt-5">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-red-200 py-3.5 text-[15px] font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.99]"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </form>
    </div>
  );
}
