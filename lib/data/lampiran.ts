import { createClient } from "@/lib/supabase/server";
import { BUCKET_SURAT, SIGNED_URL_DETIK } from "@/lib/lampiran-config";

export interface Lampiran {
  id: number;
  namaFile: string;
  ukuranBytes: number;
  mime: string;
  url: string; // Signed URL, berlaku 60 menit
}

export async function getLampiranAgenda(agendaId: number): Promise<Lampiran[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lampiran_surat")
    .select("id, file_path, file_name, file_size_bytes, mime_type")
    .eq("agenda_id", agendaId)
    .order("created_at");
  if (error) throw new Error(`Database: ${error.message}`);
  if (!data || data.length === 0) return [];

  const { data: urls } = await supabase.storage
    .from(BUCKET_SURAT)
    .createSignedUrls(
      data.map((d) => d.file_path as string),
      SIGNED_URL_DETIK,
    );

  const peta = new Map<string, string>();
  for (const u of urls ?? []) {
    if (u.path && u.signedUrl) peta.set(u.path, u.signedUrl);
  }

  return data.flatMap((d) => {
    const url = peta.get(d.file_path as string);
    if (!url) return [];
    return [
      {
        id: d.id as number,
        namaFile: d.file_name as string,
        ukuranBytes: Number(d.file_size_bytes ?? 0),
        mime: String(d.mime_type ?? ""),
        url,
      },
    ];
  });
}
