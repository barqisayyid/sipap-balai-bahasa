import { createClient } from "@/lib/supabase/server";
import { getNow } from "@/lib/date";
import type { Agenda, StatusAgenda } from "@/lib/types";

const TABEL = "agenda_pimpinan";
// quick_token sengaja TIDAK diambil: hanya dipakai server untuk Quick-Action (Fase 5)
const KOLOM =
  "id, nomor_surat, pengirim, perihal, lokasi, link_maps, waktu_mulai, waktu_selesai, pakaian, pendamping, catatan, status, is_sensitive";

interface Baris {
  id: number;
  nomor_surat: string | null;
  pengirim: string | null;
  perihal: string;
  lokasi: string;
  link_maps: string | null;
  waktu_mulai: string;
  waktu_selesai: string;
  pakaian: string | null;
  pendamping: string | null;
  catatan: string | null;
  status: StatusAgenda;
  is_sensitive: boolean;
}

const opsional = (v: string | null) => v ?? undefined;

function petakan(r: Baris): Agenda {
  return {
    id: r.id,
    perihal: r.perihal,
    lokasi: r.lokasi,
    waktuMulai: r.waktu_mulai,
    waktuSelesai: r.waktu_selesai,
    status: r.status,
    isSensitive: r.is_sensitive,
    nomorSurat: opsional(r.nomor_surat),
    pengirim: opsional(r.pengirim),
    linkMaps: opsional(r.link_maps),
    pakaian: opsional(r.pakaian),
    pendamping: opsional(r.pendamping),
    catatan: opsional(r.catatan),
  };
}

function cek(error: { message: string } | null) {
  if (error) throw new Error(`Database: ${error.message}`);
}

const iso = (d: string | Date) => new Date(d).toISOString();
const pad = (n: number) => String(n).padStart(2, "0");

export type FilterAgenda = "mendatang" | "menunggu" | "semua";
export type AgendaBaru = Omit<Agenda, "id" | "status">;

/** Agenda aktif pada satu tanggal ("YYYY-MM-DD", WIB) */
export async function getAgendaByDate(dateKey: string): Promise<Agenda[]> {
  const awal = new Date(`${dateKey}T00:00:00+07:00`);
  const akhir = new Date(awal.getTime() + 86_400_000);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABEL)
    .select(KOLOM)
    .is("deleted_at", null)
    .neq("status", "Batal")
    .gte("waktu_mulai", awal.toISOString())
    .lt("waktu_mulai", akhir.toISOString())
    .order("waktu_mulai");
  cek(error);
  return ((data ?? []) as unknown as Baris[]).map(petakan);
}

/** Agenda aktif yang belum selesai, mulai dari sekarang */
export async function getAgendaTerdekat(
  now: Date,
  limit = 3,
): Promise<Agenda[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABEL)
    .select(KOLOM)
    .is("deleted_at", null)
    .neq("status", "Batal")
    .gte("waktu_selesai", now.toISOString())
    .order("waktu_mulai")
    .limit(limit);
  cek(error);
  return ((data ?? []) as unknown as Baris[]).map(petakan);
}

export async function getAgendaById(id: number): Promise<Agenda | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABEL)
    .select(KOLOM)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  cek(error);
  return data ? petakan(data as unknown as Baris) : null;
}

/** Semua agenda aktif pada satu bulan (urut waktu) */
export async function getAgendaBulan(
  tahun: number,
  bulan: number,
): Promise<Agenda[]> {
  const awal = `${tahun}-${pad(bulan)}-01T00:00:00+07:00`;
  const akhir =
    bulan === 12
      ? `${tahun + 1}-01-01T00:00:00+07:00`
      : `${tahun}-${pad(bulan + 1)}-01T00:00:00+07:00`;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABEL)
    .select(KOLOM)
    .is("deleted_at", null)
    .neq("status", "Batal")
    .gte("waktu_mulai", iso(awal))
    .lt("waktu_mulai", iso(akhir))
    .order("waktu_mulai");
  cek(error);
  return ((data ?? []) as unknown as Baris[]).map(petakan);
}

/** Agenda aktif sejak kemarin ke depan (bahan deteksi bentrok di form) */
export async function getAgendaAktif(): Promise<Agenda[]> {
  const sejak = new Date(getNow().getTime() - 86_400_000).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABEL)
    .select(KOLOM)
    .is("deleted_at", null)
    .neq("status", "Batal")
    .gte("waktu_selesai", sejak)
    .order("waktu_mulai")
    .limit(500);
  cek(error);
  return ((data ?? []) as unknown as Baris[]).map(petakan);
}

/**
 * Pemeriksaan bentrok resmi di database.
 * Aturan sama dengan lib/conflict.ts: mulaiBaru < selesaiLama DAN selesaiBaru > mulaiLama.
 */
export async function getAgendaBentrok(
  mulai: string,
  selesai: string,
  abaikanId?: number,
): Promise<Agenda[]> {
  const supabase = await createClient();
  let q = supabase
    .from(TABEL)
    .select(KOLOM)
    .is("deleted_at", null)
    .neq("status", "Batal")
    .lt("waktu_mulai", iso(selesai))
    .gt("waktu_selesai", iso(mulai));

  if (abaikanId !== undefined) {
    q = q.neq("id", abaikanId);
  }

  const { data, error } = await q.order("waktu_mulai");
  cek(error);
  return ((data ?? []) as unknown as Baris[]).map(petakan);
}

/** Untuk halaman Daftar Agenda */
export async function getDaftarAgenda(
  filter: FilterAgenda,
  now: Date,
): Promise<Agenda[]> {
  const supabase = await createClient();
  let q = supabase.from(TABEL).select(KOLOM).is("deleted_at", null);

  if (filter !== "semua") {
    q = q.neq("status", "Batal").gte("waktu_selesai", now.toISOString());
  }
  if (filter === "menunggu") {
    q = q.eq("status", "Menunggu Konfirmasi");
  }

  const { data, error } = await q.order("waktu_mulai").limit(200);
  cek(error);
  return ((data ?? []) as unknown as Baris[]).map(petakan);
}

/** Status awal selalu "Menunggu Konfirmasi" (DEFAULT di tabel). Mengembalikan id baru. */
export async function createAgenda(
  data: AgendaBaru,
  dibuatOleh: string,
): Promise<number> {
  const supabase = await createClient();
  const { data: baris, error } = await supabase
    .from(TABEL)
    .insert({
      perihal: data.perihal,
      lokasi: data.lokasi,
      waktu_mulai: iso(data.waktuMulai),
      waktu_selesai: iso(data.waktuSelesai),
      nomor_surat: data.nomorSurat ?? null,
      pengirim: data.pengirim ?? null,
      link_maps: data.linkMaps ?? null,
      // Jika kosong, biarkan DEFAULT tabel ('Pakaian Dinas Harian (PDH)') berlaku
      ...(data.pakaian ? { pakaian: data.pakaian } : {}),
      pendamping: data.pendamping ?? null,
      catatan: data.catatan ?? null,
      is_sensitive: data.isSensitive,
      created_by: dibuatOleh,
    })
    .select("id")
    .single();
  cek(error);
  return (baris as { id: number }).id;
}

export async function updateAgenda(
  id: number,
  data: Partial<AgendaBaru>,
): Promise<void> {
  const supabase = await createClient();
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.perihal !== undefined) updateData.perihal = data.perihal;
  if (data.lokasi !== undefined) updateData.lokasi = data.lokasi;
  if (data.waktuMulai !== undefined) updateData.waktu_mulai = iso(data.waktuMulai);
  if (data.waktuSelesai !== undefined)
    updateData.waktu_selesai = iso(data.waktuSelesai);
  if (data.nomorSurat !== undefined)
    updateData.nomor_surat = data.nomorSurat ?? null;
  if (data.pengirim !== undefined) updateData.pengirim = data.pengirim ?? null;
  if (data.linkMaps !== undefined) updateData.link_maps = data.linkMaps ?? null;
  if (data.pakaian !== undefined) updateData.pakaian = data.pakaian ?? null;
  if (data.pendamping !== undefined)
    updateData.pendamping = data.pendamping ?? null;
  if (data.catatan !== undefined) updateData.catatan = data.catatan ?? null;
  if (data.isSensitive !== undefined) updateData.is_sensitive = data.isSensitive;

  const { error } = await supabase
    .from(TABEL)
    .update(updateData)
    .eq("id", id)
    .is("deleted_at", null);
  cek(error);
}

export async function deleteAgenda(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from(TABEL)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);
  cek(error);
}
