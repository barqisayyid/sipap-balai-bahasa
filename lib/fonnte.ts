import "server-only";

export interface HasilKirim {
  ok: boolean;
  alasan?: string;
  payload?: unknown;
}

/** Ubah "0812…", "812…", "+62 812…" menjadi "62812…". Null jika tidak valid. */
export function normalisasiNomor(input: string): string | null {
  let n = input.replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  else if (n.startsWith("8")) n = "62" + n;
  return /^62\d{8,13}$/.test(n) ? n : null;
}

/** Kirim satu pesan WhatsApp lewat Fonnte. Tidak pernah melempar error. */
export async function kirimWA(
  nomor: string,
  pesan: string,
): Promise<HasilKirim> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) return { ok: false, alasan: "FONNTE_TOKEN belum diisi" };

  const target = normalisasiNomor(nomor);
  if (!target)
    return { ok: false, alasan: `Nomor tujuan tidak valid: ${nomor}` };

  const form = new FormData();
  form.append("target", target);
  form.append("message", pesan);
  form.append("countryCode", "0"); // nomor sudah lengkap berawalan 62
  form.append("connectOnly", "true"); // gagal jika perangkat terputus

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: token },
      body: form,
      signal: AbortSignal.timeout(15_000),
    });
    const payload: unknown = await res.json().catch(() => null);
    const p = payload as { status?: boolean; reason?: string } | null;

    if (res.ok && p?.status === true) return { ok: true, payload };
    return { ok: false, alasan: p?.reason ?? `HTTP ${res.status}`, payload };
  } catch (e) {
    return {
      ok: false,
      alasan: e instanceof Error ? e.message : "Kesalahan jaringan",
    };
  }
}
