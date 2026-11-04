import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  antrikan,
  prosesAntrean,
  rencanakanNotifikasi,
} from "@/lib/notif/antrean";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function cocok(terima: string | null, asli: string): boolean {
  if (!terima) return false;
  const a = Buffer.from(terima);
  const b = Buffer.from(asli);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function pingHealthcheck() {
  const url = process.env.HEALTHCHECK_URL;
  if (!url) return;
  try {
    await fetch(url, { signal: AbortSignal.timeout(3000) });
  } catch {
    /* abaikan */
  }
}

export async function GET(request: NextRequest) {
  const rahasia = process.env.CRON_SECRET;
  if (!rahasia) {
    return NextResponse.json(
      { error: "CRON_SECRET belum diisi" },
      { status: 500 },
    );
  }

  // Fitur uji hanya aktif di komputer pengembang, tidak di produksi
  const dev = process.env.NODE_ENV !== "production";
  const sp = request.nextUrl.searchParams;

  const header = request.headers.get("authorization");
  const terima = header?.startsWith("Bearer ")
    ? header.slice(7)
    : dev
      ? sp.get("secret")
      : null;
  if (!cocok(terima, rahasia)) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  let now = new Date();
  if (dev && sp.get("simulasi")) {
    const s = new Date(sp.get("simulasi")!);
    if (!Number.isNaN(s.getTime())) now = s;
  }

  try {
    const rencana = await rencanakanNotifikasi(now);

    if (dev && sp.get("kering") === "1") {
      return NextResponse.json({
        kering: true,
        waktuSimulasi: now.toISOString(),
        jumlah: rencana.length,
        rencana: rencana.map((r) => ({
          tipe: r.tipe,
          kepada: r.namaPenerima,
          kunci: r.kunci_dedupe,
          pesan: r.isi_pesan,
        })),
      });
    }

    await antrikan(rencana);
    const hasil = await prosesAntrean(now);
    await pingHealthcheck();

    return NextResponse.json({
      ok: true,
      direncanakan: rencana.length,
      ...hasil,
    });
  } catch (e) {
    console.error("[cron]", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Kesalahan" },
      { status: 500 },
    );
  }
}
