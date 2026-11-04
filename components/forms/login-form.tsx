"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { masuk } from "@/lib/actions/auth";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20";

export function LoginForm({ pesanAwal }: { pesanAwal?: string }) {
  const [state, formAction, pending] = useActionState(masuk, null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  const pesan = state?.error ?? pesanAwal;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          placeholder="nama@instansi.go.id"
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
          Kata Sandi
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={inputCls}
        />
      </label>

      {pesan && (
        <p role="alert" className="text-[13px] font-medium text-red-600">
          {pesan}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-primary py-3.5 text-[15px] font-bold text-white transition-all hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
